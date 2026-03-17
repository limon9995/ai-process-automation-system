import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';

const router = Router();
router.get('/stats', dashboardController.stats);
export default router;
