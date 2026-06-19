const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const sendMail = require('../controllers/email.controller');
const { apiKeyAuth } = require('../middlewares/auth.middleware');
const { sendMailValidation, validate } = require('../middlewares/validation.middleware');

const router = Router();

const emailRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Too many requests, please try again later',
  },
});

router.post('/', emailRateLimiter, apiKeyAuth, sendMailValidation, validate, sendMail);

module.exports = router;
