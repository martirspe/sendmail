const { Router } = require('express');
const getInfo = require('../controllers/info.controller');

const router = Router();

router.get('/', getInfo);

module.exports = router;
