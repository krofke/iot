const router = require('express-promise-router')();
const loginController = require('../controllers/login.controller');

router.get('/1', loginController.loginFlow1);
router.post('/2', loginController.passport.authenticate('local'), loginController.loginInterno );//login com usuario e senha
router.get('/0', loginController.logOut);//logout
router.get('/jwt', loginController.getJwt);//obtem jwt
router.get('/key', loginController.getPublicKey);//obtem jwt
router.get('/jwt-validade', loginController.jwtValidade);//valida
router.post('/jwt-superadmin', loginController.generateJwtSuperAdmin)//Gera jwt para applicações
router.get('/google', loginController.passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', loginController.passport.authenticate('google', { failureRedirect: '/sso/' }), loginController.googleCallback);

module.exports = router;