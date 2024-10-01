const { Router } = require('express')
const entregaController = require('../controllers/entrega.controller')
const validate = require('../middlewares/validate')
const checkRole = require('../middlewares/checkRole')
const upload = require('../middlewares/multerConfig') // Asegúrate de exportar `upload` desde el archivo donde configuraste multer
const router = Router()

router.post('/',
  checkRole.checkRoleEstudiante,
  upload.single('pdf'),
  entregaController.crearEntrega
)

router.get('/listarEntregas/:entregaPactada_id',
  checkRole.checkRoleDocente,
  entregaController.listarEntregasDocente
)

// Descomentar y actualizar si es necesario
// router.get('/:id',
//   validate({ params: entregaPactadaScheme.idParams }),
//   entregaPactadaController.ver
// );

module.exports = router
