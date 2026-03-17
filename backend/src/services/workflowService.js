import { aiService } from './aiService.js';
import { logService } from './logService.js';
import { messageService } from './messageService.js';
import { assignmentService } from './assignmentService.js';
import { orderService } from './orderService.js';
import { supportService } from './supportService.js';
import { queryService } from './queryService.js';
import { emailService } from './emailService.js';
import { validateWithSchema, extractionSchema } from '../utils/validators.js';

const workflowHandlers = {
  order: async ({ message, extractedData, assignment }) => {
    const order = orderService.upsertFromMessage(message.id, extractedData, assignment?.id ?? null);
    return { entityType: 'order', entity: order };
  },

  support: async ({ message, extractedData, assignment }) => {
    const ticket = supportService.upsertFromMessage(message.id, extractedData, assignment?.id ?? null);
    return { entityType: 'support', entity: ticket };
  },

  query: async ({ message, extractedData, assignment }) => {
    const queryCase = queryService.upsertFromMessage(message.id, extractedData, assignment?.id ?? null);
    return { entityType: 'query', entity: queryCase };
  },

  other: async () => ({ entityType: 'other', entity: null })
};

const defaultResult = {
  success: false,
  message: null,
  assignment: null,
  entityType: null,
  entity: null,
  logs: []
};

const buildEmailSubject = (message) => {
  const base = message.email_subject || 'Atualização da sua solicitação';
  return base.startsWith('Re:') ? base : `Re: ${base}`;
};

export const workflowService = {
  async processIncomingMessage(input) {
    const payload = typeof input === 'string' ? { rawText: input, source: 'manual' } : input;
    const message = messageService.create(payload);

    logService.create(message.id, 'received', 'success', 'Incoming message stored.', {
      source: payload.source || 'manual',
      emailSender: payload.emailSender || null,
      emailSubject: payload.emailSubject || null
    });

    return this.processMessageById(message.id);
  },

  async processMessageById(messageId, options = {}) {
    const message = messageService.findById(messageId);
    if (!message) return { ...defaultResult, error: 'Message not found.' };

    try {
      messageService.updateProcessing(messageId, {
        processingState: 'processing',
        workflowStatus: 'pending',
        errorMessage: null,
        replyError: null,
        source: message.source,
        replyStatus: message.source === 'gmail' ? 'queued' : message.reply_status
      });

      const classify = await aiService.classifyMessage(message.raw_text);

      logService.create(
        messageId,
        'classified',
        classify.error ? (classify.source === 'fallback' ? 'warning' : 'error') : 'success',
        classify.error ? 'Classification completed with fallback/error context.' : 'Classification completed.',
        { error: classify.error, source: classify.source, result: classify.data }
      );

      const workflowType = classify.data.type;

      const extract = options.manualExtractedData
        ? {
            success: true,
            data: options.manualExtractedData,
            error: null,
            source: 'manual-override',
            attempts: 0
          }
        : await aiService.extractData(message.raw_text, workflowType);

      logService.create(
        messageId,
        'extracted',
        extract.error ? (extract.source === 'fallback' ? 'warning' : 'error') : 'success',
        extract.error
          ? 'Extraction completed with retry/fallback context.'
          : options.manualExtractedData
            ? 'Manual extracted data applied for workflow re-run.'
            : 'Structured extraction completed.',
        { error: extract.error, source: extract.source, attempts: extract.attempts, result: extract.data }
      );

      const validatedExtraction = validateWithSchema(extractionSchema, extract.data || {});
      if (!validatedExtraction.success) {
        throw new Error(`Extraction validation failed: ${validatedExtraction.error}`);
      }

      logService.create(
        messageId,
        'validated',
        'success',
        'Extracted payload validated against extraction schema.',
        { workflowType }
      );

      const assignment = workflowType === 'other' ? null : assignmentService.assign(messageId, workflowType);
      if (assignment) {
        logService.create(messageId, 'assigned', 'success', `Assigned to ${assignment.name}.`, { assignment });
      }

      const handler = workflowHandlers[workflowType] || workflowHandlers.other;
      const entityResult = await handler({
        message,
        extractedData: validatedExtraction.data,
        assignment,
        options
      });

      const reply = await aiService.generateReply(workflowType, message.raw_text, validatedExtraction.data);

      logService.create(
        messageId,
        'replied',
        reply.error ? (reply.source === 'fallback' ? 'warning' : 'error') : 'success',
        reply.error ? 'Reply generated with fallback/error context.' : 'Reply generated.',
        { error: reply.error, source: reply.source, reply: reply.data }
      );

      let replyStatus = message.source === 'gmail' ? 'queued' : 'not_applicable';
      let replyError = null;
      let replyRetryCount = message.reply_retry_count;
      let emailProcessedAt = message.email_processed_at;

      if (message.source === 'gmail' && message.email_sender) {
        try {
          const delivery = await emailService.sendReply({
            to: message.email_sender,
            subject: buildEmailSubject(message),
            text: reply.data,
            inReplyTo: message.external_id || null
          });

          replyStatus = 'sent';
          emailProcessedAt = new Date().toISOString();

          logService.create(
            messageId,
            'replied',
            'success',
            'Email reply sent to Gmail sender.',
            { delivery, to: message.email_sender }
          );
        } catch (error) {
          replyStatus = 'failed';
          replyError = error.message;
          replyRetryCount += 1;
          logService.createError(messageId, 'error', error, {
            scope: 'workflowService.sendEmailReply',
            to: message.email_sender
          });
        }
      }

      const nextProcessingState = replyStatus === 'failed' ? 'failed' : 'completed';

      const nextMessage = messageService.updateProcessing(messageId, {
        classification: workflowType,
        extractedData: validatedExtraction.data,
        generatedReply: reply.data,
        workflowStatus: workflowType,
        processingState: nextProcessingState,
        errorMessage: replyStatus === 'failed' ? replyError : null,
        lastProcessedAt: new Date().toISOString(),
        retryCount: message.retry_count,
        replyStatus,
        replyError,
        replyRetryCount,
        emailProcessedAt
      });

      return {
        success: replyStatus !== 'failed',
        message: nextMessage,
        assignment,
        entityType: entityResult.entityType,
        entity: entityResult.entity,
        logs: logService.listForMessage(messageId)
      };
    } catch (error) {
      messageService.updateProcessing(messageId, {
        processingState: 'failed',
        errorMessage: error.message,
        lastProcessedAt: new Date().toISOString(),
        retryCount: message.retry_count
      });

      logService.createError(messageId, 'error', error, {
        scope: 'workflowService.processMessageById'
      });

      return {
        ...defaultResult,
        success: false,
        error: error.message,
        message: messageService.findById(messageId),
        logs: logService.listForMessage(messageId)
      };
    }
  },

  async retryMessage(messageId) {
    const existing = messageService.incrementRetry(messageId);
    if (!existing) return { ...defaultResult, error: 'Message not found.' };

    logService.create(messageId, 'retried', 'info', 'Manual workflow retry triggered from dashboard/API.', {
      retryCount: existing.retry_count
    });

    return this.processMessageById(messageId);
  },

  async retryReply(messageId) {
    const message = messageService.findById(messageId);
    if (!message) return { ...defaultResult, error: 'Message not found.' };

    if (message.source !== 'gmail' || !message.email_sender) {
      return {
        ...defaultResult,
        error: 'Reply retry is available only for Gmail messages with sender info.',
        message
      };
    }

    const updated = messageService.incrementReplyRetry(messageId);

    logService.create(messageId, 'retried', 'info', 'Manual reply retry triggered.', {
      replyRetryCount: updated.reply_retry_count
    });

    try {
      const replyText = message.generated_reply || (await aiService.generateReply(
        message.classification || 'other',
        message.raw_text,
        message.extractedData || {}
      )).data;

      const delivery = await emailService.sendReply({
        to: message.email_sender,
        subject: buildEmailSubject(message),
        text: replyText,
        inReplyTo: message.external_id || null
      });

      const nextMessage = messageService.updateProcessing(messageId, {
        generatedReply: replyText,
        replyStatus: 'sent',
        replyError: null,
        emailProcessedAt: new Date().toISOString(),
        processingState: 'completed',
        errorMessage: null
      });

      logService.create(messageId, 'replied', 'success', 'Reply re-sent successfully.', { delivery });

      return {
        success: true,
        message: nextMessage,
        logs: logService.listForMessage(messageId)
      };
    } catch (error) {
      messageService.updateProcessing(messageId, {
        replyStatus: 'failed',
        replyError: error.message,
        processingState: 'failed',
        errorMessage: error.message
      });

      logService.createError(messageId, 'error', error, {
        scope: 'workflowService.retryReply'
      });

      return {
        success: false,
        error: error.message,
        message: messageService.findById(messageId),
        logs: logService.listForMessage(messageId)
      };
    }
  },

  async rerunWithManualData(messageId, extractedData) {
    const existing = messageService.updateExtractedData(messageId, extractedData);
    if (!existing) return { ...defaultResult, error: 'Message not found.' };

    messageService.incrementRetry(messageId);

    logService.create(messageId, 'validated', 'info', 'Extracted data manually overridden before workflow re-run.', {
      extractedData
    });

    return this.processMessageById(messageId, {
      manualOverride: true,
      manualExtractedData: extractedData
    });
  }
};