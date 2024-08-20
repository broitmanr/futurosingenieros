const { Router } = require('express')
const cursoController = require('../controllers/curso.controller')
const validate = require('../middlewares/validate')
const cursoScheme = require('../middlewares/schemes/curso.scheme')
const checkRole = require("../middlewares/checkRole")
const router = Router();


router.post('/', validate(cursoScheme.crearCurso),checkRole.checkRoleDocente,cursoController.crear);
router.get('/:id',cursoController.ver);
router.get('/',cursoController.listar)

module.exports = router;