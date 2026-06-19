const { getRoutes } = require('../config/env');
const pkg = require('../package.json');

const getInfo = (req, res) => {
  const routes = getRoutes();
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  return res.status(200).json({
    ok: true,
    name: pkg.name,
    version: pkg.version,
    endpoints: {
      info: `${baseUrl}${routes.rootPath}`,
      health: `${baseUrl}${routes.healthPath}`,
      sendmail: `${baseUrl}${routes.sendmailPath}`,
    },
  });
};

module.exports = getInfo;
