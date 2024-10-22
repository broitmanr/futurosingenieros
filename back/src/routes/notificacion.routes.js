const { Router } = require('express')
const Notificacion = require('../controllers/notificacion.controller')
const checkRole = require('../middlewares/checkRole')
const router = Router()


router.get('/', checkRole.checkRole('D', 'A'), Notificacion.obtenerUltimasNotificaciones)
router.patch('/:id',checkRole.checkRole('D','A'),Notificacion.marcarLeido)
module.exports = router
