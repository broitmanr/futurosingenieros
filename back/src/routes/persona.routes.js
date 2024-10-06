const { Router } = require('express')
const Persona = require('../controllers/persona.controller')
const validate = require('../middlewares/validate')
const grupo = require('../middlewares/schemes/grupo.scheme')
const checkRole = require('../middlewares/checkRole')
const router = Router()


router.get('/legajoCurso/:legajo/:curso', checkRole.checkRole('D', 'A'), Persona.getByLegajoAndCurso)

module.exports = router
