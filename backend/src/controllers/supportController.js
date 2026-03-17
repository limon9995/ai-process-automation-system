import { supportService } from '../services/supportService.js';
import { logService } from '../services/logService.js';

const validStatuses = ['open', 'in-progress', 'resolved'];

export const supportController = {
  list(_req, res) {
    res.json(supportService.list());
  },

  updateStatus(req, res) {
    const id = Number(req.params.id);
    const status = String(req.body.status || '');

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid support status.' });
    }

    const ticket = supportService.updateStatus(id, status);
    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found.' });
    }

    logService.create(ticket.message_id, 'assigned', 'info', `Support ticket status manually changed to ${status}.`);
    res.json(ticket);
  }
};
