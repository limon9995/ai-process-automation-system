import { db } from '../db/database.js';

const selectSql = `
  SELECT q.*, u.name as assigned_user_name, u.role as assigned_user_role
  FROM query_cases q
  LEFT JOIN users u ON u.id = q.assigned_user_id
`;

export const queryService = {
  upsertFromMessage(messageId, extractedData, assignedUserId = null) {
    const existing = db.prepare('SELECT * FROM query_cases WHERE message_id = ?').get(messageId);

    const requesterName = extractedData.customerName || null;
    const email = extractedData.email || null;
    const phone = extractedData.phone || null;
    const organization = extractedData.organization || null;
    const subject = extractedData.subject || extractedData.topic || 'Solicitação comercial / informativa';
    const inquirySummary = extractedData.issueSummary || extractedData.notes || null;
    const city = extractedData.city || null;
    const status = assignedUserId ? 'reviewing' : 'new';

    if (existing) {
      db.prepare(`
        UPDATE query_cases
        SET requester_name = ?, email = ?, phone = ?, organization = ?, subject = ?, inquiry_summary = ?, city = ?, assigned_user_id = ?, status = ?
        WHERE message_id = ?
      `).run(
        requesterName,
        email,
        phone,
        organization,
        subject,
        inquirySummary,
        city,
        assignedUserId,
        status,
        messageId
      );
    } else {
      db.prepare(`
        INSERT INTO query_cases (message_id, requester_name, email, phone, organization, subject, inquiry_summary, city, assigned_user_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        messageId,
        requesterName,
        email,
        phone,
        organization,
        subject,
        inquirySummary,
        city,
        assignedUserId,
        status
      );
    }

    return this.findByMessageId(messageId);
  },

  findByMessageId(messageId) {
    return db.prepare(`${selectSql} WHERE q.message_id = ?`).get(messageId);
  },

  list(status) {
    if (status && status !== 'all') {
      return db.prepare(`${selectSql} WHERE q.status = ? ORDER BY datetime(q.created_at) DESC, q.id DESC`).all(status);
    }

    return db.prepare(`${selectSql} ORDER BY datetime(q.created_at) DESC, q.id DESC`).all();
  },

  updateStatus(id, status) {
    db.prepare('UPDATE query_cases SET status = ? WHERE id = ?').run(status, id);
    return db.prepare(`${selectSql} WHERE q.id = ?`).get(id);
  }
};