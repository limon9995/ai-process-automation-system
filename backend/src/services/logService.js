import { db } from '../db/database.js';
import { stringifyJson } from '../utils/json.js';

export const logService = {
  create(messageId, step, status, detail, metadata = null) {
    const stmt = db.prepare(`
      INSERT INTO automation_logs (message_id, step, status, detail, metadata)
      VALUES (?, ?, ?, ?, ?)
    `);

    const info = stmt.run(messageId ?? null, step, status, detail, metadata ? stringifyJson(metadata) : null);
    return this.findById(info.lastInsertRowid);
  },

  createError(messageId, step, error, metadata = null) {
    return this.create(messageId, step, 'error', error instanceof Error ? error.message : String(error), metadata);
  },

  findById(id) {
    return db.prepare('SELECT * FROM automation_logs WHERE id = ?').get(id);
  },

  list(limit = 200) {
    return db.prepare(`
      SELECT * FROM automation_logs
      ORDER BY datetime(created_at) DESC, id DESC
      LIMIT ?
    `).all(limit);
  },

  listForMessage(messageId) {
    return db.prepare(`
      SELECT * FROM automation_logs
      WHERE message_id = ?
      ORDER BY datetime(created_at) ASC, id ASC
    `).all(messageId);
  }
};
