const { Router } = require('express')
const Inasistencia = require('../controllers/inasistencia.controller')
const validate = require('../middlewares/validate')
const checkRole = require('../middlewares/checkRole')
const router = Router()

router.post('/curso/:curso_id', checkRole.checkRoleDocente, Inasistencia.registrarInasistencias)
router.post('/incrementar', checkRole.checkRoleDocente, Inasistencia.incrementarInasistencia)
router.patch('/editar', checkRole.checkRoleDocente, Inasistencia.editarInasistencia)

module.exports = router
