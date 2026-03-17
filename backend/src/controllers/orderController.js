import { orderService } from '../services/orderService.js';
import { logService } from '../services/logService.js';

const validStatuses = ['new', 'processing', 'assigned', 'completed', 'failed'];

export const orderController = {
  list(req, res) {
    res.json(orderService.list(req.query.status));
  },

  updateStatus(req, res) {
    const id = Number(req.params.id);
    const status = String(req.body.status || '');

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    const order = orderService.updateStatus(id, status);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    logService.create(order.message_id, 'assigned', 'info', `Order status manually changed to ${status}.`);
    res.json(order);
  }
};
