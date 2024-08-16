const { Router } = require('express')
const usuariosRoutes = require('./usuario.routes')
const authRoutes = require('./auth.routes')
const decodeJWT = require('../middlewares/decodeJWT')
const cursoRoutes = require('./curso.routes')
const comisionRoutes = require('./comision.routes')
const materiaRoutes = require('./materia.routes')


const rutas_init = () => {
    const router = Router();

    router.use("/usuarios",decodeJWT, usuariosRoutes)
    router.use("/curso",decodeJWT,cursoRoutes)
    router.use("/comision",decodeJWT,comisionRoutes)
    router.use("/materia",decodeJWT,materiaRoutes)
    return router;
}

const rutas_auth = () => {
    const router = Router()
    router.use("/auth",authRoutes)
    return router

}

module.exports = { rutas_init, rutas_auth }