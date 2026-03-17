import { Router } from 'express';
import { gmailController } from '../controllers/gmailController.js';

const router = Router();
router.get('/status', gmailController.status);
router.post('/fetch-now', gmailController.fetchNow);
export default router;
