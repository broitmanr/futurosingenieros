
const { Router } = require('express')
const comisionController =require('../controllers/comision.controller')
const router = Router();

router.get('/', comisionController.listar)

module.exports = router


