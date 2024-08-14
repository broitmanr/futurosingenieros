const { Router } = require('express')
const materiaController = require('../controllers/materia.controller')

const router = Router();


router.get('/:anio', materiaController.listarByAnio);

module.exports = router;