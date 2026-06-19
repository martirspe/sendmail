const nodemailer = require('nodemailer');
const logger = require('../config/logger');
const { logError } = logger;

let transporter = null;

function getTlsOptions() {
  if (process.env.EMAIL_TLS_REJECT_UNAUTHORIZED === 'false') {
    return { rejectUnauthorized: false };
  }

  return undefined;
}

function createTransporter() {
  const config = {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT) || 15000,
    greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT) || 15000,
  };

  const tls = getTlsOptions();
  if (tls) {
    config.tls = tls;
  }

  return nodemailer.createTransport(config);
}

async function initEmailService() {
  transporter = createTransporter();

  try {
    await transporter.verify();
    logger.info({ host: process.env.EMAIL_HOST }, 'SMTP connection verified');
  } catch (error) {
    logError(
      error,
      `SMTP verification failed on startup (host: ${process.env.EMAIL_HOST}) — check EMAIL_HOST in .env`
    );
  }
}

async function verifyConnection() {
  if (!transporter) {
    throw new Error('Email service not initialized');
  }

  await transporter.verify();
}

async function sendEmail({ to, subject, html, bcc, cc }) {
  if (!transporter) {
    throw new Error('Email service not initialized');
  }

  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  return transporter.sendMail({
    from,
    to,
    cc: cc || undefined,
    bcc: bcc || undefined,
    subject,
    html,
  });
}

function closeEmailService() {
  if (transporter) {
    transporter.close();
    transporter = null;
  }
}

module.exports = {
  initEmailService,
  verifyConnection,
  sendEmail,
  closeEmailService,
};
