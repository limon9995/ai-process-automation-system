import { db } from '../db/database.js';
import { userService } from './userService.js';

// Role routing for Brazilian telecom/media/community context:
// - order (commercial lead/partnership): account-manager
// - support (operational issues): support-operator
// - query (info requests, events, community): community-manager or support-operator
// Falls back to any available operator if preferred role is not seeded.
const getAssignmentCandidates = (workflowType) => {
  const all = userService.listOperators();

  let preferred;
  if (workflowType === 'order') {
    preferred = all.filter((u) => u.role === 'account-manager');
  } else if (workflowType === 'support') {
    preferred = all.filter((u) => u.role === 'support-operator');
  } else if (workflowType === 'query') {
    preferred = all.filter((u) => u.role === 'community-manager' || u.role === 'support-operator');
  } else {
    preferred = all;
  }

  return preferred.length ? preferred : all;
};

export const assignmentService = {
  assign(messageId, workflowType) {
    const candidates = getAssignmentCandidates(workflowType);
    if (!candidates.length) return null;

    const counts = db.prepare(`
      SELECT user_id, COUNT(*) as total
      FROM assignments
      GROUP BY user_id
    `).all();

    const countMap = new Map(counts.map((item) => [item.user_id, item.total]));

    const selected = [...candidates].sort((a, b) => {
      const aCount = countMap.get(a.id) || 0;
      const bCount = countMap.get(b.id) || 0;
      if (aCount !== bCount) return aCount - bCount;
      return a.id - b.id;
    })[0];

    db.prepare(`
      INSERT INTO assignments (message_id, user_id, workflow_type)
      VALUES (?, ?, ?)
    `).run(messageId, selected.id, workflowType);

    return selected;
  },

  findByMessageId(messageId) {
    return db.prepare(`
      SELECT a.*, u.name, u.role
      FROM assignments a
      JOIN users u ON u.id = a.user_id
      WHERE a.message_id = ?
      ORDER BY a.id DESC
      LIMIT 1
    `).get(messageId);
  }
};
