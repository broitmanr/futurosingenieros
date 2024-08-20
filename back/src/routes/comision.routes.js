const { Router } = require('express')

const comisionController =require('../controllers/comision.controller')
const router = Router();



router.get('/:anio', comisionController.listar);

module.exports = router;