const { logError } = require('../config/logger');

const notFoundHandler = (req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Route not found',
  });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      ok: false,
      error: 'Invalid JSON body',
    });
  }

  logError(err, 'Unhandled error');

  res.status(err.status || 500).json({
    ok: false,
    error: err.expose ? err.message : 'Internal server error',
  });
};

module.exports = { notFoundHandler, errorHandler };
