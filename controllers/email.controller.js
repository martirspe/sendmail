const logger = require('../config/logger');
const { logError } = logger;
const { sendEmail } = require('../services/email.service');

const sendMail = async (req, res) => {
  const { to, subject, html, bcc, cc } = req.body;

  try {
    const info = await sendEmail({ to, subject, html, bcc, cc });

    logger.info({ messageId: info.messageId }, 'Email sent');

    return res.status(200).json({
      ok: true,
      messageId: info.messageId,
    });
  } catch (error) {
    logError(error, 'Failed to send email');

    return res.status(502).json({
      ok: false,
      error: 'Could not send email',
    });
  }
};

module.exports = sendMail;
