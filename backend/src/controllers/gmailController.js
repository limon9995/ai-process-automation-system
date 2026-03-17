import { gmailFetchService } from '../services/gmailFetchService.js';
import { env } from '../config/env.js';

export const gmailController = {
  async fetchNow(_req, res) {
    const result = await gmailFetchService.pollNow();
    res.status(result.success ? 200 : 500).json(result);
  },

  status(_req, res) {
    res.json({
      enabled: env.enableGmailPolling,
      intervalMs: env.gmailPollIntervalMs,
      configured: Boolean(env.emailUser && env.emailPass && env.imapHost && env.smtpHost)
    });
  }
};
