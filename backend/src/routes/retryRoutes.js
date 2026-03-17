import { Router } from 'express';
import { messageController } from '../controllers/messageController.js';

const router = Router();
router.post('/:id', messageController.retry);
export default router;
