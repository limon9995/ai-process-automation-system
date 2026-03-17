import { Router } from 'express';
import { webhookController } from '../controllers/webhookController.js';

const router = Router();

router.post('/incoming-message', webhookController.incomingMessage);

export default router;