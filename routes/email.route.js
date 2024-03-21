const { Router } = require('express');
const sendMail = require('../controllers/email.controller');
const router = Router();

router.post('/', sendMail);

module.exports = router;