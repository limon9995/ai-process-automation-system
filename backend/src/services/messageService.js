import { db } from '../db/database.js';
import { safeJsonParse, stringifyJson } from '../utils/json.js';

const baseMessageSelect = `
  SELECT m.*, 
    a.user_id as assignment_user_id,
    u.name as assigned_user_name,
    u.role as assigned_user_role
  FROM messages m
  LEFT JOIN assignments a ON a.id = (
    SELECT id FROM assignments WHERE message_id = m.id ORDER BY id DESC LIMIT 1
  )
  LEFT JOIN users u ON u.id = a.user_id
`;

const hydrateMessage = (message) => {
  if (!message) return null;
  return {
    ...message,
    extractedData: message.extracted_data ? safeJsonParse(message.extracted_data).data : null,
    logs: []
  };
};

export const messageService = {
  create(input) {
    const payload = typeof input === 'string' ? { rawText: input } : input;
    const rawText = String(payload.rawText || '').trim();
    const source = payload.source || 'manual';
    const emailSender = payload.emailSender || null;
    const emailSubject = payload.emailSubject || null;
    const externalId = payload.externalId || null;

    const info = db.prepare(`
      INSERT INTO messages (raw_text, source, email_sender, email_subject, external_id, reply_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      rawText,
      source,
      emailSender,
      emailSubject,
      externalId,
      source === 'gmail' ? 'queued' : 'not_applicable'
    );

    return this.findById(info.lastInsertRowid);
  },

  findByExternalId(externalId) {
    const row = db.prepare(`${baseMessageSelect} WHERE m.external_id = ?`).get(externalId);
    return hydrateMessage(row);
  },

  updateProcessing(id, patch) {
    const current = this.findById(id);
    if (!current) return null;

    const has = (key) => Object.prototype.hasOwnProperty.call(patch, key);

    const next = {
      classification: has('classification') ? patch.classification : current.classification,
      extracted_data: has('extractedData') ? stringifyJson(patch.extractedData) : current.extracted_data,
      generated_reply: has('generatedReply') ? patch.generatedReply : current.generated_reply,
      workflow_status: has('workflowStatus') ? patch.workflowStatus : current.workflow_status,
      processing_state: has('processingState') ? patch.processingState : current.processing_state,
      error_message: has('errorMessage') ? patch.errorMessage : current.error_message,
      retry_count: has('retryCount') ? patch.retryCount : current.retry_count,
      last_processed_at: has('lastProcessedAt') ? patch.lastProcessedAt : current.last_processed_at,
      reply_status: has('replyStatus') ? patch.replyStatus : current.reply_status,
      reply_error: has('replyError') ? patch.replyError : current.reply_error,
      reply_retry_count: has('replyRetryCount') ? patch.replyRetryCount : current.reply_retry_count,
      email_processed_at: has('emailProcessedAt') ? patch.emailProcessedAt : current.email_processed_at,
      email_sender: has('emailSender') ? patch.emailSender : current.email_sender,
      email_subject: has('emailSubject') ? patch.emailSubject : current.email_subject,
      source: has('source') ? patch.source : current.source
    };

    db.prepare(`
      UPDATE messages
      SET classification = ?, extracted_data = ?, generated_reply = ?, workflow_status = ?,
          processing_state = ?, error_message = ?, retry_count = ?, last_processed_at = ?,
          reply_status = ?, reply_error = ?, reply_retry_count = ?, email_processed_at = ?,
          email_sender = ?, email_subject = ?, source = ?
      WHERE id = ?
    `).run(
      next.classification,
      next.extracted_data,
      next.generated_reply,
      next.workflow_status,
      next.processing_state,
      next.error_message,
      next.retry_count,
      next.last_processed_at,
      next.reply_status,
      next.reply_error,
      next.reply_retry_count,
      next.email_processed_at,
      next.email_sender,
      next.email_subject,
      next.source,
      id
    );

    return this.findById(id);
  },

  updateExtractedData(id, extractedData) {
    db.prepare(`
      UPDATE messages
      SET extracted_data = ?, processing_state = 'manual-review'
      WHERE id = ?
    `).run(stringifyJson(extractedData), id);

    return this.findById(id);
  },

  incrementRetry(id) {
    db.prepare('UPDATE messages SET retry_count = retry_count + 1 WHERE id = ?').run(id);
    return this.findById(id);
  },

  incrementReplyRetry(id) {
    db.prepare('UPDATE messages SET reply_retry_count = reply_retry_count + 1 WHERE id = ?').run(id);
    return this.findById(id);
  },

  findById(id) {
    const message = db.prepare(`${baseMessageSelect} WHERE m.id = ?`).get(id);
    return hydrateMessage(message);
  },

  list(filters = {}) {
    const clauses = [];
    const params = [];

    if (filters.source && filters.source !== 'all') {
      clauses.push('m.source = ?');
      params.push(filters.source);
    }

    if (filters.classification && filters.classification !== 'all') {
      clauses.push('m.classification = ?');
      params.push(filters.classification);
    }

    if (filters.processingState && filters.processingState !== 'all') {
      clauses.push('m.processing_state = ?');
      params.push(filters.processingState);
    }

    const whereSql = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
    const sql = `${baseMessageSelect}${whereSql} ORDER BY datetime(m.created_at) DESC, m.id DESC`;

    const rows = db.prepare(sql).all(...params);
    return rows.map(hydrateMessage);
  }
};