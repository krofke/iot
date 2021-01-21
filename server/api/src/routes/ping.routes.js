const router = require('express-promise-router')();
const pingController = require('../controllers/ping.controller');
router.get('/ping', pingController.ping);


module.exports = router;