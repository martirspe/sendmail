const REQUIRED_VARS = [
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_SECURE',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'API_KEY',
];

const DEFAULT_LOCAL_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4200',
  'http://127.0.0.1:4200',
];

function normalizeBasePath(value) {
  if (!value || value.trim() === '' || value.trim() === '/') {
    return '';
  }

  let path = value.trim();

  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  return path.replace(/\/+$/, '');
}

function getApiRoute() {
  const route = process.env.API_ROUTE || 'sendmail';
  return route.replace(/^\/+|\/+$/g, '');
}

function getRoutes() {
  const basePath = normalizeBasePath(process.env.API_BASE_PATH);
  const apiRoute = getApiRoute();

  return {
    basePath,
    apiRoute,
    healthPath: `${basePath}/health`,
    sendmailPath: `${basePath}/${apiRoute}`,
    rootPath: basePath || '/',
  };
}

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  const port = Number(process.env.EMAIL_PORT);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error('EMAIL_PORT must be a valid positive number');
  }

  if (!['true', 'false'].includes(process.env.EMAIL_SECURE)) {
    throw new Error('EMAIL_SECURE must be "true" or "false"');
  }

  const apiRoute = getApiRoute();
  if (!/^[a-zA-Z0-9_-]+$/.test(apiRoute)) {
    throw new Error('API_ROUTE must contain only letters, numbers, hyphens and underscores');
  }

  const placeholders = [
    { key: 'EMAIL_HOST', patterns: [/tudominio\.com/i, /mail\.domain\.com/i] },
    { key: 'EMAIL_USER', patterns: [/correo@tudominio\.com/i, /user@domain\.com/i] },
    { key: 'EMAIL_PASSWORD', patterns: [/^your-password$/i] },
    { key: 'API_KEY', patterns: [/^your-secret-api-key$/i] },
  ];

  for (const { key, patterns } of placeholders) {
    const value = process.env[key] || '';
    if (patterns.some((pattern) => pattern.test(value))) {
      throw new Error(
        `${key} still has a placeholder value from .env.example — configure your real SMTP credentials`
      );
    }
  }
}

function getCorsOptions() {
  const origins = process.env.CORS_ORIGIN;

  if (!origins || origins.trim() === '') {
    return {
      origin: DEFAULT_LOCAL_ORIGINS,
      methods: ['GET', 'POST'],
    };
  }

  if (origins.trim() === '*') {
    return {
      origin: '*',
      methods: ['GET', 'POST'],
    };
  }

  return {
    origin: origins.split(',').map((origin) => origin.trim()).filter(Boolean),
    methods: ['GET', 'POST'],
  };
}

module.exports = {
  validateEnv,
  getCorsOptions,
  getRoutes,
  getApiRoute,
  normalizeBasePath,
};
