import express from 'express';
import authController from '../controllers/auth.controller.js'
import validate from '../middlewares/validate.js'
import authScheme from '../middlewares/schemes/auth.scheme.js'

const router = express.Router()
router.post('/sign-in',validate(authScheme.login),authController.login)
// router.post('/sign-in',authController.login)
router.post('/sign-up',authController.registrarse)

export default router