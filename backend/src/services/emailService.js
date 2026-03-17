import nodemailer from 'nodemailer';
import { env, isGmailConfigured } from '../config/env.js';

let transporter = null;

const getTransporter = () => {
  if (!isGmailConfigured) {
    throw new Error('Gmail SMTP is not configured. Set EMAIL_USER, EMAIL_PASS, SMTP_HOST, and related settings.');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.emailUser,
        pass: env.emailPass
      }
    });
  }

  return transporter;
};

export const emailService = {
  isConfigured() {
    return isGmailConfigured;
  },

  async sendReply({ to, subject, text, inReplyTo = null }) {
    const transport = getTransporter();

    const result = await transport.sendMail({
      from: env.emailUser,
      to,
      subject,
      text,
      ...(inReplyTo ? { inReplyTo, references: inReplyTo } : {})
    });

    return {
      messageId: result.messageId,
      accepted: result.accepted || []
    };
  }
};
