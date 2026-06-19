require('dotenv').config();

const { validateEnv } = require('./config/env');
const logger = require('./config/logger');
const { initEmailService, closeEmailService } = require('./services/email.service');
const Server = require('./models/server');

async function shutdown(server, signal) {
  logger.info({ signal }, 'Shutting down gracefully');

  try {
    await server.close();
    closeEmailService();
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Error during shutdown');
    process.exit(1);
  }
}

async function main() {
  validateEnv();
  await initEmailService();

  const server = new Server();
  await server.listen();

  process.on('SIGTERM', () => shutdown(server, 'SIGTERM'));
  process.on('SIGINT', () => shutdown(server, 'SIGINT'));
}

main().catch((error) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
