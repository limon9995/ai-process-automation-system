import { queryService } from '../services/queryService.js';
import { logService } from '../services/logService.js';

const validStatuses = ['new', 'reviewing', 'closed'];

export const queryController = {
  list(req, res) {
    res.json(queryService.list(req.query.status));
  },

  updateStatus(req, res) {
    const id = Number(req.params.id);
    const status = String(req.body.status || '');

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid query case status.' });
    }

    const item = queryService.updateStatus(id, status);
    if (!item) {
      return res.status(404).json({ error: 'Query case not found.' });
    }

    logService.create(item.message_id, 'validated', 'info', `Query case status manually changed to ${status}.`);
    res.json(item);
  }
};