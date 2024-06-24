const router = require('express').Router()

const usuariosController = require('../controllers/usuario.controller')

router.get('/', usuariosController.prueba)

module.exports = router