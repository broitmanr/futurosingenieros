const { Router } = require('express')
const usuariosRoutes = require('./usuario.routes')

const rutas_init = () =>{
    const router = Router()

    router.use("/usuarios",usuariosRoutes)
    return router


}

module.exports = { rutas_init }