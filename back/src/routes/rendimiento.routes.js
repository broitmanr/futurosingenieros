const { Router } = require('express')
const Rendimiento = require('../controllers/rendimiento.controller')
const validate = require('../middlewares/validate')
const checkRole = require('../middlewares/checkRole')
const {checkRoleEstudiante} = require("../middlewares/checkRole");
const router = Router()

router.get('/alumno/:cursoId',checkRole.checkRole('A'),Rendimiento.alumno )
router.get('/alumno/:cursoId/:alumnoId',checkRole.checkRole('D'),Rendimiento.alumno )
router.get('/alumnos/:cursoId',checkRole.checkRole('D'),Rendimiento.listarAlumnosDelCurso )

module.exports = router
