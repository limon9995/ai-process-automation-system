import { Router } from 'express';
import { logController } from '../controllers/logController.js';

const router = Router();
router.get('/', logController.list);
export default router;
