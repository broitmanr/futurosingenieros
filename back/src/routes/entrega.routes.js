const { Router } = require('express')
const entregaController = require('../controllers/entrega.controller')
const validate = require('../middlewares/validate')
const checkRole = require('../middlewares/checkRole')
const upload = require('../middlewares/multerConfig') // Asegúrate de exportar `upload` desde el archivo donde configuraste multer
const router = Router()

router.post('/',
  checkRole.checkRoleEstudiante,
  entregaController.crearEntrega
)

router.get('/listarEntregas/:entregaPactada_id',
  checkRole.checkRoleDocente,
  entregaController.listarEntregasDocente
)

// Nueva ruta para subir un archivo a una entrega existente
router.post('/upload/:id',
  upload.single('file'),
  entregaController.uploadEntregaFile
)

// Nueva ruta para crear una entrega con un archivo asociado
router.post('/crear-con-archivo',
  upload.single('file'),
  entregaController.crearEntrega
)

// Descomentar y actualizar si es necesario
// router.get('/:id',
//   validate({ params: entregaPactadaScheme.idParams }),
//   entregaPactadaController.ver
// );

module.exports = router
