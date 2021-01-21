const router = require('express-promise-router')();
const healthController = require('../controllers/health.controller');
router.get('/read', healthController.health);
module.exports = router;