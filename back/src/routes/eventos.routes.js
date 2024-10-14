const express = require('express')
const router = express.Router()
const diasEspecialesController = require('../controllers/diasEspeciales.controller.js')
const checkRole = require('../middlewares/checkRole')

router.post('/crear', checkRole.checkRoleDocente, diasEspecialesController.crearDiaEspecial)
router.get('/listar', diasEspecialesController.listarDiasEspeciales)
router.get('/recuperar/:id', diasEspecialesController.obtenerDiaEspecial)
router.put('/actualizar/:id', checkRole.checkRoleDocente, diasEspecialesController.actualizarDiaEspecial)
router.delete('/eliminar/:id', checkRole.checkRoleDocente, diasEspecialesController.eliminarDiaEspecial)

module.exports = router
