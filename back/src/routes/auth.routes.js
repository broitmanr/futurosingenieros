const express = require('express')
const authController = require('../controllers/auth.controller')
const validate = require('../middlewares/validate')
const authScheme = require('../middlewares/schemes/auth.scheme')

const router = express.Router()
/**
 * @swagger
 * /sign-in:
 *   post:
 *     summary: User login
 *     description: Allows a user to log in by providing credentials.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: User successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/sign-in', validate(authScheme.login), authController.login)
// router.post('/sign-in',authController.login)
router.post('/sign-up', authController.registrarse)
router.post('/sign-out', authController.logout)
module.exports = router
