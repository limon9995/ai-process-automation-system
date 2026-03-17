import { Router } from 'express';
import { queryController } from '../controllers/queryController.js';

const router = Router();

router.get('/', queryController.list);
router.put('/:id/status', queryController.updateStatus);

export default router;