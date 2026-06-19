const { body, validationResult } = require('express-validator');

const sendMailValidation = [
  body('to')
    .trim()
    .notEmpty()
    .withMessage('to is required')
    .isEmail()
    .withMessage('to must be a valid email'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('subject is required')
    .isLength({ max: 200 })
    .withMessage('subject must be at most 200 characters'),
  body('html')
    .notEmpty()
    .withMessage('html is required')
    .isLength({ max: 500000 })
    .withMessage('html content is too large'),
  body('bcc')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('bcc must be a valid email'),
  body('cc')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('cc must be a valid email'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array().map(({ msg, path }) => ({ field: path, message: msg })),
    });
  }

  next();
};

module.exports = { sendMailValidation, validate };
