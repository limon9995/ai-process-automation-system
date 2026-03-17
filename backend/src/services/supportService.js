import { db } from '../db/database.js';

const selectSql = `
  SELECT s.*, u.name as assigned_user_name, u.role as assigned_user_role
  FROM support_tickets s
  LEFT JOIN users u ON u.id = s.assigned_user_id
`;

export const supportService = {
  upsertFromMessage(messageId, extractedData, assignedUserId = null) {
    const existing = db.prepare('SELECT * FROM support_tickets WHERE message_id = ?').get(messageId);

    if (existing) {
      db.prepare(`
        UPDATE support_tickets
        SET customer_name = ?, phone = ?, subject = ?, issue_summary = ?, priority = ?, assigned_user_id = ?, status = ?
        WHERE message_id = ?
      `).run(
        extractedData.customerName,
        extractedData.phone,
        extractedData.subject || 'Customer request',
        extractedData.issueSummary || extractedData.notes,
        extractedData.priority || 'medium',
        assignedUserId,
        assignedUserId ? 'in-progress' : 'open',
        messageId
      );
    } else {
      db.prepare(`
        INSERT INTO support_tickets (message_id, customer_name, phone, subject, issue_summary, priority, assigned_user_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        messageId,
        extractedData.customerName,
        extractedData.phone,
        extractedData.subject || 'Customer request',
        extractedData.issueSummary || extractedData.notes,
        extractedData.priority || 'medium',
        assignedUserId,
        assignedUserId ? 'in-progress' : 'open'
      );
    }

    return this.findByMessageId(messageId);
  },

  findByMessageId(messageId) {
    return db.prepare(`${selectSql} WHERE s.message_id = ?`).get(messageId);
  },

  list() {
    return db.prepare(`${selectSql} ORDER BY datetime(s.created_at) DESC, s.id DESC`).all();
  },

  updateStatus(id, status) {
    db.prepare('UPDATE support_tickets SET status = ? WHERE id = ?').run(status, id);
    return db.prepare(`${selectSql} WHERE s.id = ?`).get(id);
  }
};
