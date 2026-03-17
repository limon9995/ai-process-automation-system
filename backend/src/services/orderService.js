import { db } from '../db/database.js';

const selectSql = `
  SELECT o.*, u.name as assigned_user_name, u.role as assigned_user_role
  FROM orders o
  LEFT JOIN users u ON u.id = o.assigned_user_id
`;

export const orderService = {
  upsertFromMessage(messageId, extractedData, assignedUserId = null) {
    const existing = db.prepare('SELECT * FROM orders WHERE message_id = ?').get(messageId);

    if (existing) {
      db.prepare(`
        UPDATE orders
        SET customer_name = ?, phone = ?, product = ?, quantity = ?, address = ?, city = ?, notes = ?, assigned_user_id = ?, status = ?
        WHERE message_id = ?
      `).run(
        extractedData.customerName,
        extractedData.phone,
        extractedData.product,
        extractedData.quantity,
        extractedData.address,
        extractedData.city,
        extractedData.notes,
        assignedUserId,
        assignedUserId ? 'assigned' : 'new',
        messageId
      );
    } else {
      db.prepare(`
        INSERT INTO orders (message_id, customer_name, phone, product, quantity, address, city, notes, assigned_user_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        messageId,
        extractedData.customerName,
        extractedData.phone,
        extractedData.product,
        extractedData.quantity,
        extractedData.address,
        extractedData.city,
        extractedData.notes,
        assignedUserId,
        assignedUserId ? 'assigned' : 'new'
      );
    }

    return this.findByMessageId(messageId);
  },

  findByMessageId(messageId) {
    return db.prepare(`${selectSql} WHERE o.message_id = ?`).get(messageId);
  },

  list(status) {
    if (status && status !== 'all') {
      return db.prepare(`${selectSql} WHERE o.status = ? ORDER BY datetime(o.created_at) DESC, o.id DESC`).all(status);
    }

    return db.prepare(`${selectSql} ORDER BY datetime(o.created_at) DESC, o.id DESC`).all();
  },

  updateStatus(id, status) {
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    return db.prepare(`${selectSql} WHERE o.id = ?`).get(id);
  }
};
