process.env.API_ROUTE = 'sendmail';
process.env.API_BASE_PATH = '';
process.env.API_PORT = '0';
process.env.EMAIL_HOST = 'smtp.test.com';
process.env.EMAIL_PORT = '465';
process.env.EMAIL_SECURE = 'true';
process.env.EMAIL_USER = 'test@test.com';
process.env.EMAIL_PASSWORD = 'password';
process.env.EMAIL_FROM = 'test@test.com';
process.env.API_KEY = 'test-api-key';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });
const mockVerify = jest.fn().mockResolvedValue(true);
const mockClose = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
    verify: mockVerify,
    close: mockClose,
  })),
}));

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const infoRoutes = require('../routes/info.route');
const emailRoutes = require('../routes/email.route');
const healthRoutes = require('../routes/health.route');
const { notFoundHandler, errorHandler } = require('../middlewares/error.middleware');
const { getCorsOptions, getRoutes } = require('../config/env');
const { initEmailService, closeEmailService } = require('../services/email.service');

function createTestApp(envOverrides = {}) {
  Object.assign(process.env, envOverrides);
  const routes = getRoutes();
  const app = express();

  app.use(helmet());
  app.use(cors(getCorsOptions()));
  app.use(express.json({ limit: '100kb' }));
  app.use(routes.rootPath, infoRoutes);
  app.use(routes.healthPath, healthRoutes);
  app.use(routes.sendmailPath, emailRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, routes };
}

describe('SendMail API', () => {
  let app;
  let routes;

  beforeAll(async () => {
    await initEmailService();
    ({ app, routes } = createTestApp());
  });

  afterAll(() => {
    closeEmailService();
  });

  beforeEach(() => {
    mockSendMail.mockClear();
    mockVerify.mockClear();
  });

  describe('GET / (info)', () => {
    it('returns API info with endpoint URLs', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.endpoints.health).toContain('/health');
      expect(response.body.endpoints.sendmail).toContain('/sendmail');
    });
  });

  describe('GET /health', () => {
    it('returns healthy status when SMTP is connected', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.smtp).toBe('connected');
    });
  });

  describe('POST /sendmail', () => {
    const validPayload = {
      to: 'recipient@test.com',
      subject: 'Test subject',
      html: '<p>Test message</p>',
    };

    it('rejects requests without API key', async () => {
      const response = await request(app)
        .post('/sendmail')
        .send(validPayload);

      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });

    it('rejects requests with invalid API key', async () => {
      const response = await request(app)
        .post('/sendmail')
        .set('X-API-Key', 'wrong-key')
        .send(validPayload);

      expect(response.status).toBe(401);
    });

    it('rejects invalid email payload', async () => {
      const response = await request(app)
        .post('/sendmail')
        .set('X-API-Key', 'test-api-key')
        .send({ to: 'invalid-email', subject: '', html: '' });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('sends email successfully with valid payload and API key', async () => {
      const response = await request(app)
        .post('/sendmail')
        .set('X-API-Key', 'test-api-key')
        .send(validPayload);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.messageId).toBe('test-message-id');
    });

    it('returns 502 when SMTP fails', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP error'));

      const response = await request(app)
        .post('/sendmail')
        .set('X-API-Key', 'test-api-key')
        .send(validPayload);

      expect(response.status).toBe(502);
      expect(response.body.ok).toBe(false);
    });
  });

  describe('API_BASE_PATH', () => {
    it('mounts routes under a configurable base path', async () => {
      const scoped = createTestApp({ API_BASE_PATH: '/api' });

      const info = await request(scoped.app).get('/api/');
      const health = await request(scoped.app).get('/api/health');
      const unauthorized = await request(scoped.app).post('/api/sendmail').send({
        to: 'recipient@test.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(info.status).toBe(200);
      expect(health.status).toBe(200);
      expect(unauthorized.status).toBe(401);
      expect(scoped.routes.sendmailPath).toBe('/api/sendmail');
    });
  });

  describe('Unknown routes', () => {
    it('returns 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown');

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });

    it('returns 400 for invalid JSON body', async () => {
      const response = await request(app)
        .post('/sendmail')
        .set('Content-Type', 'application/json')
        .set('X-API-Key', 'test-api-key')
        .send('{ invalid json');

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });
  });
});
