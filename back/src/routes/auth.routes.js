const express = require('express');
const authController = require('../controllers/auth.controller')
const validate = require('../middlewares/validate')
const authScheme = require('../middlewares/schemes/auth.scheme')

const router = express.Router()
router.post('/sign-in',validate(authScheme.login),authController.login)
// router.post('/sign-in',authController.login)
router.post('/sign-up',authController.registrarse)

module.exports = router