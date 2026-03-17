import { dashboardService } from '../services/dashboardService.js';

export const dashboardController = {
  stats(_req, res) {
    res.json(dashboardService.getStats());
  }
};
