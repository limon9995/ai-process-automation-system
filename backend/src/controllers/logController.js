import { logService } from '../services/logService.js';

export const logController = {
  list(_req, res) {
    res.json(logService.list());
  }
};
