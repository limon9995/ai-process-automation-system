import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const resolveDbPath = () => {
  const value = process.env.DB_PATH || './data/automation.db';
  return path.isAbsolute(value) ? value : path.resolve(rootDir, value);
};

const toBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
};

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  dbPath: resolveDbPath(),
  enableAi: process.env.ENABLE_AI !== 'false',
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  imapHost: process.env.IMAP_HOST || 'imap.gmail.com',
  imapPort: Number(process.env.IMAP_PORT || 993),
  imapSecure: toBool(process.env.IMAP_SECURE, true),
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT || 465),
  smtpSecure: toBool(process.env.SMTP_SECURE, true),
  gmailPollIntervalMs: Number(process.env.GMAIL_POLL_INTERVAL_MS || 60000),
  enableGmailPolling: toBool(process.env.ENABLE_GMAIL_POLLING, false)
};

export const isGmailConfigured = Boolean(env.emailUser && env.emailPass && env.imapHost && env.smtpHost);
