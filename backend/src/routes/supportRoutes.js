import { Router } from 'express';
import { supportController } from '../controllers/supportController.js';

const router = Router();
router.get('/', supportController.list);
router.put('/:id/status', supportController.updateStatus);
export default router;
