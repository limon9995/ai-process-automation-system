import { Router } from 'express';
import { messageController } from '../controllers/messageController.js';

const router = Router();

router.get('/', messageController.list);
router.post('/', messageController.submit);
router.post('/retry/:id', messageController.retry);
router.post('/:id/retry-reply', messageController.retryReply);
router.put('/:id/extracted-data', messageController.rerunWithManualData);

export default router;