import { logService } from '../services/logService.js';

export const errorHandler = (error, req, res, _next) => {
  console.error(error);
  logService.createError(null, 'error', error, {
    path: req.originalUrl,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal server error',
    detail: error.message
  });
};
