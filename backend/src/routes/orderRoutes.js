import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';

const router = Router();
router.get('/', orderController.list);
router.put('/:id/status', orderController.updateStatus);
export default router;
