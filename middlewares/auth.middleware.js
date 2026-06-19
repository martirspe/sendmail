const crypto = require('crypto');

const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;

  if (!apiKey || !expectedKey) {
    return res.status(401).json({
      ok: false,
      error: 'Unauthorized',
    });
  }

  const provided = Buffer.from(String(apiKey));
  const expected = Buffer.from(String(expectedKey));

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return res.status(401).json({
      ok: false,
      error: 'Unauthorized',
    });
  }

  next();
};

module.exports = { apiKeyAuth };
