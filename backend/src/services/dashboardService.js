import { db } from '../db/database.js';

export const dashboardService = {
  getStats() {
    const totalMessages = db.prepare('SELECT COUNT(*) as count FROM messages').get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const totalTickets = db.prepare('SELECT COUNT(*) as count FROM support_tickets').get().count;
    const totalQueryCases = db.prepare('SELECT COUNT(*) as count FROM query_cases').get().count;
    const failedWorkflows = db.prepare("SELECT COUNT(*) as count FROM messages WHERE processing_state = 'failed'").get().count;
    const openOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status IN ('new','processing','assigned')").get().count;
    const openSupport = db.prepare("SELECT COUNT(*) as count FROM support_tickets WHERE status IN ('open','in-progress')").get().count;
    const openQueryCases = db.prepare("SELECT COUNT(*) as count FROM query_cases WHERE status IN ('new','reviewing')").get().count;
    const gmailMessages = db.prepare("SELECT COUNT(*) as count FROM messages WHERE source = 'gmail'").get().count;
    const failedReplies = db.prepare("SELECT COUNT(*) as count FROM messages WHERE reply_status = 'failed'").get().count;
    const processedToday = db.prepare(`
      SELECT COUNT(*) as count
      FROM messages
      WHERE date(last_processed_at) = date('now')
         OR date(created_at) = date('now')
    `).get().count;

    return {
      totalMessages,
      totalOrders,
      totalTickets,
      totalQueryCases,
      failedWorkflows,
      openOrders,
      openSupport,
      openQueryCases,
      gmailMessages,
      failedReplies,
      processedToday
    };
  }
};