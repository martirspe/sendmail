const { verifyConnection } = require('../services/email.service');

const healthCheck = async (req, res) => {
  try {
    await verifyConnection();

    return res.status(200).json({
      ok: true,
      status: 'healthy',
      smtp: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return res.status(503).json({
      ok: false,
      status: 'unhealthy',
      smtp: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = healthCheck;
