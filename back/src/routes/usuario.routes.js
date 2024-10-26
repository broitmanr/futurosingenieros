const { Router } = require('express')

const usuarioController = require('../controllers/usuario.controller')
const validate = require('../middlewares/validate')
const usuarioScheme = require('../middlewares/schemes/usuario.scheme')
const router = Router()

router.post('/', validate(usuarioScheme.crearUsuario), usuarioController.crear)
router.get('/miPerfil', usuarioController.MiPerfil)
module.exports = router
