const { Router } = require('express')
const Grupo = require('../controllers/grupo.controller')
const validate = require('../middlewares/validate')
const grupo = require('../middlewares/schemes/grupo.scheme')
const checkRole = require('../middlewares/checkRole')
const router = Router()

router.post('/', validate(grupo.crearGrupo), checkRole.checkRoleEstudiante, Grupo.crear)
router.post('/addPersona', validate(grupo.addPersonaGrupo), checkRole.checkRoleEstudiante, Grupo.addToGroup)
// router.get('/tiposInstancias', InstanciaEvaluativa.listarTiposInstancias)
router.get('/curso/:cursoID', checkRole.checkRole('D', 'A'), Grupo.listar)
router.get('/:id', checkRole.checkRole('D', 'A'), Grupo.ver)

module.exports = router
