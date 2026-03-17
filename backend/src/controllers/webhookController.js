import { workflowService } from '../services/workflowService.js';

export const webhookController = {
  async incomingMessage(req, res) {
    const rawText = String(req.body.text || req.body.rawText || '').trim();

    if (!rawText) {
      return res.status(400).json({ error: 'rawText or text is required.' });
    }

    const payload = {
      rawText,
      source: String(req.body.source || 'api').trim() || 'api',
      emailSender: req.body.emailSender || req.body.sender || null,
      emailSubject: req.body.emailSubject || req.body.subject || null,
      externalId: req.body.externalId || null
    };

    const result = await workflowService.processIncomingMessage(payload);
    return res.status(result.success ? 201 : 500).json(result);
  }
};