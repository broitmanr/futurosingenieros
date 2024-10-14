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

router.get('/listarEntregasHechas/:idEntregaPactada',
  checkRole.checkRoleDocente,
  entregaController.listarEntregasParaElDocente
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
  checkRole.checkRole('A', 'D'),
  entregaController.ver
)

router.get('/miEntregaAlumno/:idEntregaPactada', entregaController.obtenerEntregaComoAlumno)
module.exports = router
