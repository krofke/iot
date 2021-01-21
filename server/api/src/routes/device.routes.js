
const router = require('express-promise-router')();
const deviceController = require('../controllers/device.controller');
router.get('/register', deviceController.register);
module.exports = router;