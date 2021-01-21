const router = require('express-promise-router')();
const userController = require('../controllers/user-state.controller');
router.get('/get', userController.getState);
router.post('/set', userController.setState);
module.exports = router;