const { Router } = require('express')
const entregaController = require('../controllers/entrega.controller')
const checkRole = require('../middlewares/checkRole')
const { uploadPDFs } = require('../middlewares/multerConfig')
const router = Router()

router.post('/',
  checkRole.checkRoleEstudiante,
  uploadPDFs.array('pdfs', 5), // Permitir hasta 5 archivos PDF
  entregaController.crearEntrega
)

router.get('/listarEntregas/:entregaPactada_id',
  checkRole.checkRoleDocente,
  entregaController.listarEntregasDocente
)

router.patch('/calificar/:idEntrega',
  checkRole.checkRoleDocente,
  entregaController.calificarEntrega
)
router.post('/asociarArchivos/:entregaId',
  checkRole.checkRoleEstudiante,
  uploadPDFs.array('pdfs', 5), // Permitir hasta 5 archivos PDF
  entregaController.asociarArchivosConEntrega
)

router.get('/:id',
    checkRole.checkRole('A','D'),
    entregaController.ver
)


module.exports = router
