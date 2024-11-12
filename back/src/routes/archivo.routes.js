const { Router } = require('express')
const archivoController = require('../controllers/archivo.controller')
const { uploadFiles } = require('../middlewares/multerConfig')
const router = Router()

// Ruta para subir imágenes
// router.post('/subir-imagen', uploadImagenes.single('imagen'), archivoController.subirImagen);
router.get('/curso/:cursoId', archivoController.getListaMaterialCursada)
router.get('/imagen/nombre/:nombre', archivoController.obtenerImagenByNombre)
router.get('/imagen/:id', archivoController.obtenerImagen)
router.get('/:id', archivoController.obtenerFile)
router.post('/comentario/:id', archivoController.hacerComentario)
router.post('/comentario/responder/:id', archivoController.responderComentario)
router.get('/comentario/:id', archivoController.getComentarios)
router.put('/comentario/:id', archivoController.editComentario)
router.delete('/comentario/:id', archivoController.deleteComentario)
router.post('/subirMaterial/:cursoId', uploadFiles.array('files', 5), archivoController.subirMaterialCursada)
router.get('/:cursoId/:nombre', archivoController.getMaterialCursadaByName)
router.delete('/:id', archivoController.deleteMaterial)
module.exports = router
