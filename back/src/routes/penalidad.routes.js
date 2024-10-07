const express = require('express')
const router = express.Router()
const penalidadController = require('../controllers/penalidad.controller')

// Ruta para crear una penalidad
router.post('/crear', penalidadController.crear)

// Ruta para listar todas las penalidades
router.get('/listar', penalidadController.listar)

// Ruta para obtener una penalidad por ID
router.get('/ver/:id', penalidadController.ver)

router.get('/estado-alumno/:legajo', penalidadController.obtenerEstadoAlumno)
router.get('/estados-alumnos-curso/:cursoID', penalidadController.obtenerEstadosAlumnosCurso)

module.exports = router
