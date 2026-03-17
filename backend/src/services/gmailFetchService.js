import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { env, isGmailConfigured } from '../config/env.js';
import { logService } from './logService.js';
import { messageService } from './messageService.js';
import { workflowService } from './workflowService.js';

class GmailFetchService {
  constructor() {
    this.timer = null;
    this.isRunning = false;
  }

  isEnabled() {
    return env.enableGmailPolling && isGmailConfigured;
  }

  async pollNow() {
    if (!this.isEnabled()) {
      return { success: false, skipped: true, reason: 'Gmail polling is disabled or not configured.' };
    }

    if (this.isRunning) {
      return { success: true, skipped: true, reason: 'Previous Gmail fetch cycle is still running.' };
    }

    this.isRunning = true;

    const result = {
      success: true,
      processed: 0,
      duplicates: 0,
      errors: 0
    };

    const client = new ImapFlow({
      host: env.imapHost,
      port: env.imapPort,
      secure: env.imapSecure,
      auth: {
        user: env.emailUser,
        pass: env.emailPass
      }
    });

    try {
      await client.connect();
      await client.mailboxOpen('INBOX');

      const unseenMessages = await client.search({ seen: false });

      for (const uid of unseenMessages) {
        try {
          const fetched = await client.fetchOne(uid, {
            envelope: true,
            source: true,
            uid: true
          });

          if (!fetched) continue;

          const parsed = await simpleParser(fetched.source);
          const sender = parsed.from?.value?.[0]?.address || fetched.envelope?.from?.[0]?.address || null;
          const subject = parsed.subject || fetched.envelope?.subject || 'Sem assunto';
          const textBody = (parsed.text || parsed.html || '').toString().trim();
          const externalId = parsed.messageId || `gmail-${uid}`;

          logService.create(null, 'received', 'info', 'Unread Gmail email fetched.', {
            uid,
            sender,
            subject,
            externalId
          });

          if (!textBody) {
            await client.messageFlagsAdd(uid, ['\\Seen']);
            logService.create(null, 'error', 'warning', 'Skipped Gmail email with empty body.', {
              uid,
              sender,
              subject,
              externalId
            });
            continue;
          }

          if (messageService.findByExternalId(externalId)) {
            result.duplicates += 1;
            await client.messageFlagsAdd(uid, ['\\Seen']);

            logService.create(null, 'validated', 'info', 'Duplicate Gmail email skipped.', {
              uid,
              externalId
            });

            continue;
          }

          const workflowResult = await workflowService.processIncomingMessage({
            rawText: textBody,
            source: 'gmail',
            emailSender: sender,
            emailSubject: subject,
            externalId
          });

          if (!workflowResult.success) {
            result.errors += 1;
          } else {
            result.processed += 1;
          }

          await client.messageFlagsAdd(uid, ['\\Seen']);
        } catch (error) {
          result.errors += 1;
          logService.createError(null, 'error', error, {
            scope: 'gmailFetchService.pollNow.message'
          });
        }
      }

      return result;
    } catch (error) {
      logService.createError(null, 'error', error, {
        scope: 'gmailFetchService.pollNow'
      });

      return {
        success: false,
        processed: result.processed,
        duplicates: result.duplicates,
        errors: result.errors + 1,
        reason: error.message
      };
    } finally {
      this.isRunning = false;

      try {
        if (client.usable) {
          await client.logout();
        }
      } catch {
        // ignore
      }
    }
  }

  start() {
    if (!this.isEnabled()) {
      console.log('Gmail polling disabled. Set ENABLE_GMAIL_POLLING=true and configure email credentials.');
      return;
    }

    if (this.timer) return;

    this.pollNow().catch(() => undefined);

    this.timer = setInterval(() => {
      this.pollNow().catch(() => undefined);
    }, env.gmailPollIntervalMs);
  }
}

export const gmailFetchService = new GmailFetchService();