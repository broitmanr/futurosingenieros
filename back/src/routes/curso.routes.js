const { Router } = require('express')
const cursoController = require('../controllers/curso.controller')
const validate = require('../middlewares/validate')
const cursoScheme = require('../middlewares/schemes/curso.scheme')
const checkRole = require('../middlewares/checkRole')
const router = Router()

router.post('/', validate(cursoScheme.cursoBase), checkRole.checkRoleDocente, cursoController.crear)
router.get('/', checkRole.checkRole('D', 'A'), cursoController.listar)
router.delete('/', validate(cursoScheme.eliminarCurso), checkRole.checkRoleDocente, cursoController.eliminar)
router.put('/:id', validate(cursoScheme.cursoBase), checkRole.checkRoleDocente, cursoController.actualizar)
router.get('/:id', cursoController.ver)

router.post('/generar-codigo', validate(cursoScheme.generarCodigoVinculacion), checkRole.checkRoleDocente, cursoController.generarCodigoVinculacion)
router.post('/vincular-estudiante', validate(cursoScheme.vincularEstudiante), checkRole.checkRoleEstudiante, cursoController.vincularEstudiante)

// Rutas para gestion múltiples estudiantes a un curso
router.post('/:id/estudiante', checkRole.checkRoleDocente, cursoController.agregarEstudianteByLegajo)
router.post('/:id/estudiantes', validate(cursoScheme.agregarEstudiantes), checkRole.checkRoleDocente, cursoController.agregarEstudiantes)
router.delete('/:id/estudiantes', validate(cursoScheme.eliminarEstudiantes), checkRole.checkRoleDocente, cursoController.eliminarEstudiante)

router.get('/:id/miembros', validate(cursoScheme.verMiembrosCurso), checkRole.checkRole('D', 'A'), cursoController.verMiembrosCurso)

module.exports = router
