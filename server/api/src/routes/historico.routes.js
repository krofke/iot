const router = require('express-promise-router')();
const historicoController = require('../controllers/historico.controller');

router.post('/post', historicoController.salvarHistorico );
router.get('/historico-impersonate-licita', historicoController.obterHistoricoImpersonateLicita );

module.exports = router;