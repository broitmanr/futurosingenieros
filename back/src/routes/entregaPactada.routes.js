const { Router } = require('express')
const entregaPactadaController = require('../controllers/entregaPactada.controller')
const validate = require('../middlewares/validate')
const entregaPactadaScheme = require('../middlewares/schemes/entregaPactada.scheme')
const checkRole = require('../middlewares/checkRole')
const { validarDocenteInstanciaEvaluativa, validarDocenteEntregaPactada } = require('../middlewares/validarDocente')
const router = Router()

router.post('/',
  validate({ body: entregaPactadaScheme.entregaPactadaBase }),
  checkRole.checkRoleDocente,
  validarDocenteInstanciaEvaluativa,
  entregaPactadaController.crear
)

router.get('/:id',
  validate({ params: entregaPactadaScheme.idParams }),
  entregaPactadaController.ver
)

router.get('/instancia/:instanciaID',
  entregaPactadaController.listarEntregasInstancia
)

router.put('/:id',
  validate({ params: entregaPactadaScheme.idParams, body: entregaPactadaScheme.entregaPactadaBase }),
  checkRole.checkRoleDocente,
  validarDocenteEntregaPactada,
  entregaPactadaController.actualizar
)

router.delete('/:id',
  validate({ params: entregaPactadaScheme.idParams }),
  checkRole.checkRoleDocente,
  validarDocenteEntregaPactada,
  entregaPactadaController.eliminar
)

module.exports = router
