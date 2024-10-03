const { Router } = require('express')
const archivoController = require('../controllers/archivo.controller')
const router = Router()

// Ruta para subir imágenes
// router.post('/subir-imagen', uploadImagenes.single('imagen'), archivoController.subirImagen);

router.get('/imagen/nombre/:nombre', archivoController.obtenerImagenByNombre)
router.get('/imagen/:id', archivoController.obtenerImagen)


module.exports = router
