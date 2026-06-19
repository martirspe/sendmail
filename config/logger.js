const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

function logError(err, message) {
  logger.error(
    {
      err: {
        name: err?.name,
        message: err?.message,
        code: err?.code,
      },
    },
    message
  );
}

module.exports = logger;
module.exports.logError = logError;
