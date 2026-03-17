import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import healthRoutes from './routes/healthRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import logRoutes from './routes/logRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import retryRoutes from './routes/retryRoutes.js';
import gmailRoutes from './routes/gmailRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        // Allow non-browser tools (curl/postman) and same configured client URL.
        if (!origin || origin === env.clientUrl) return callback(null, true);

        // In development, allow localhost any port so Vite port shifts don't break CORS.
        if (env.nodeEnv !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/', (_req, res) => {
    res.json({
      service: 'AI Process Automation System API',
      version: '2.2.0'
    });
  });

  app.use('/health', healthRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/support-tickets', supportRoutes);
  app.use('/api/query-cases', queryRoutes);
  app.use('/api/logs', logRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/retry', retryRoutes);
  app.use('/api/gmail', gmailRoutes);
  app.use('/api/webhook', webhookRoutes);

  app.use(errorHandler);

  return app;
};
