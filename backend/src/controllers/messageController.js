import { messageService } from '../services/messageService.js';
import { logService } from '../services/logService.js';
import { workflowService } from '../services/workflowService.js';

export const messageController = {
  async submit(req, res) {
    const text = String(req.body.text || req.body.rawText || '').trim();
    if (!text) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const payload = {
      rawText: text,
      source: String(req.body.source || 'manual').trim() || 'manual',
      emailSender: req.body.emailSender || null,
      emailSubject: req.body.emailSubject || null,
      externalId: req.body.externalId || null
    };

    const result = await workflowService.processIncomingMessage(payload);
    const statusCode = result.success ? 201 : 500;
    return res.status(statusCode).json(result);
  },

  list(req, res) {
    const messages = messageService
      .list({
        source: req.query.source,
        classification: req.query.classification,
        processingState: req.query.processingState
      })
      .map((message) => ({
        ...message,
        logs: logService.listForMessage(message.id)
      }));

    res.json(messages);
  },

  async retry(req, res) {
    const id = Number(req.params.id);
    const result = await workflowService.retryMessage(id);

    if (!result.message) {
      return res.status(404).json({ error: result.error || 'Message not found.' });
    }

    return res.status(result.success ? 200 : 500).json(result);
  },

  async retryReply(req, res) {
    const id = Number(req.params.id);
    const result = await workflowService.retryReply(id);

    if (!result.message) {
      return res.status(404).json({ error: result.error || 'Message not found.' });
    }

    return res.status(result.success ? 200 : 500).json(result);
  },

  async rerunWithManualData(req, res) {
    const id = Number(req.params.id);
    const extractedData = req.body.extractedData;

    if (!extractedData || typeof extractedData !== 'object') {
      return res.status(400).json({ error: 'extractedData object is required.' });
    }

    const result = await workflowService.rerunWithManualData(id, extractedData);

    if (!result.message) {
      return res.status(404).json({ error: result.error || 'Message not found.' });
    }

    return res.status(result.success ? 200 : 500).json(result);
  }
};