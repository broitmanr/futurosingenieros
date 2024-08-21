const { Router } = require('express')
const cursoController = require('../controllers/curso.controller')
const validate = require('../middlewares/validate')
const cursoScheme = require('../middlewares/schemes/curso.scheme')
const checkRole = require("../middlewares/checkRole")
const router = Router();


router.post('/', validate(cursoScheme.crearCurso),checkRole.checkRoleDocente,cursoController.crear);
router.get('/:id',cursoController.ver);
router.get('/',cursoController.listar)
router.post('/generar-codigo',checkRole.checkRoleDocente,validate(cursoScheme.generarCodigoVinculacion), cursoController.generarCodigoVinculacion);
router.post('/vincular-estudiante',checkRole.checkRoleEstudiante,validate(cursoScheme.vincularEstudiante),cursoController.vincularEstudiante);

module.exports = router;