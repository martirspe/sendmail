const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const logger = require('../config/logger');
const { getCorsOptions, getRoutes } = require('../config/env');
const infoRoutes = require('../routes/info.route');
const emailRoutes = require('../routes/email.route');
const healthRoutes = require('../routes/health.route');
const { notFoundHandler, errorHandler } = require('../middlewares/error.middleware');

class Server {
  constructor() {
    this.app = express();
    this.port = Number(process.env.API_PORT) || 8000;
    this.routesConfig = getRoutes();
    this.httpServer = null;

    if (process.env.TRUST_PROXY === 'true') {
      this.app.set('trust proxy', 1);
    }

    this.middlewares();
    this.routes();
    this.errorHandlers();
  }

  middlewares() {
    this.app.use(helmet());
    this.app.use(cors(getCorsOptions()));
    this.app.use(
      pinoHttp({
        logger,
        autoLogging: {
          ignore: (req) => req.url.endsWith('/health'),
        },
      })
    );
    this.app.use(express.json({ limit: process.env.BODY_LIMIT || '100kb' }));
    this.app.use(express.urlencoded({ extended: false, limit: process.env.BODY_LIMIT || '100kb' }));
  }

  routes() {
    const { healthPath, sendmailPath, rootPath } = this.routesConfig;

    this.app.use(rootPath, infoRoutes);
    this.app.use(healthPath, healthRoutes);
    this.app.use(sendmailPath, emailRoutes);
  }

  errorHandlers() {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  listen() {
    return new Promise((resolve) => {
      this.httpServer = this.app.listen(this.port, () => {
        const { healthPath, sendmailPath } = this.routesConfig;

        logger.info(
          {
            port: this.port,
            healthPath,
            sendmailPath,
          },
          'Server started'
        );
        resolve();
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (!this.httpServer) {
        resolve();
        return;
      }

      this.httpServer.close((err) => {
        if (err) {
          reject(err);
          return;
        }

        logger.info('HTTP server closed');
        resolve();
      });
    });
  }
}

module.exports = Server;
