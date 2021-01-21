const router = require('express-promise-router')();
const userController = require('../controllers/user.controller');
router.get('/userdata', userController.userdata);
router.get('/get', userController.getAllUsersByTenant);
router.get('/get-enums', userController.getUserAcessEnum);
router.post('/put', userController.salvarUsuario);
router.get('/generate-username', userController.generateUsername);
router.get('/verifica-email', userController.verificaEmail);

module.exports = router;