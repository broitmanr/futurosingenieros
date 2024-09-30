const { Router } = require('express')
const Inasistencia = require('../controllers/inasistencia.controller')
const validate = require('../middlewares/validate')
const checkRole = require('../middlewares/checkRole')
const router = Router()

router.post('/curso/:curso_id',  checkRole.checkRoleDocente, Inasistencia.registrarInasistencias)


module.exports = router
