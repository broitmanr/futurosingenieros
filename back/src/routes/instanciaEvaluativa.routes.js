const { Router } = require('express')
const InstanciaEvaluativa = require('../controllers/instanciaEvaluativa.controller')
const validate = require('../middlewares/validate')
const instanciaEvaluativa = require('../middlewares/schemes/instanciaEvaluativa.scheme')
const checkRole = require('../middlewares/checkRole')
const router = Router()

router.post('/', validate(instanciaEvaluativa.instanciaBase), checkRole.checkRoleDocente, InstanciaEvaluativa.crear)
router.get('/tiposInstancias',InstanciaEvaluativa.listarTiposInstancias)
router.get('/:id', checkRole.checkRole('D', 'A'),InstanciaEvaluativa.ver)
router.get('/curso/:cursoID',InstanciaEvaluativa.listar)

module.exports = router
