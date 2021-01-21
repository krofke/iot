const router = require('express-promise-router')();
const userController = require('../controllers/tenant.controller');
router.get('/get', userController.getAll);
module.exports = router;