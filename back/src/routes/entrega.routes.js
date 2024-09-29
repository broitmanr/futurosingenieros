const { Router } = require('express')
const entregaController = require('../controllers/entrega.controller')
const validate = require('../middlewares/validate')
const checkRole = require('../middlewares/checkRole')
const { validarDocenteInstanciaEvaluativa, validarDocenteEntregaPactada } = require('../middlewares/validarDocente')
const router = Router()
//
// router.post('/',
//   validate({ body: entregaPactadaScheme.entregaPactadaBase }),
//   checkRole.checkRoleDocente,
//   validarDocenteInstanciaEvaluativa,
//   entregaPactadaController.crear
// )
router.get('/listarEntregas/:entregaPactada_id',
    checkRole.checkRoleDocente,
    entregaController.listarEntregasDocente
)
//
// router.get('/:id',
//   validate({ params: entregaPactadaScheme.idParams }),
//   entregaPactadaController.ver
// )



module.exports = router
