const { response, request } = require('express');
const { createTransport } = require('nodemailer');

const sendMail = async (req = request, res = response) => {
  const data = req.body;

  const config = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  const message = {
    from: `${data.from}`,
    to: `${data.to}`,
    bcc: `${data.bcc}`,
    subject: `${data.subject}`,
    html: `${data.html}`
  };

  try {
    const transport = createTransport(config);
    const info = await transport.sendMail(message);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }

}
module.exports = sendMail;