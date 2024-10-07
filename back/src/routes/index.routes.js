const { Router } = require('express')
const usuariosRoutes = require('./usuario.routes')
const authRoutes = require('./auth.routes')
const decodeJWT = require('../middlewares/decodeJWT')
const cursoRoutes = require('./curso.routes')
const comisionRoutes = require('./comision.routes')
const materiaRoutes = require('./materia.routes')
const instanciaEvaluativaRoutes = require('./instanciaEvaluativa.routes')
const entregaPactadaRoutes = require('./entregaPactada.routes.js')
const grupoRoutes = require('./grupo.routes.js')
const entregaRoutes = require('./entrega.routes.js')
const inasistenciaRoutes = require('./inasistencia.routes.js')
const archivoRoutes = require('./archivo.routes.js')
const personaRoutes = require('./persona.routes.js')
const penalidadRoutes = require('./penalidad.routes.js')

const rutasInit = () => {
  const router = Router()

  router.use('/usuarios', decodeJWT, usuariosRoutes)
  router.use('/curso', decodeJWT, cursoRoutes)
  router.use('/instanciaEvaluativa', decodeJWT, instanciaEvaluativaRoutes)
  router.use('/comision', decodeJWT, comisionRoutes)
  router.use('/materia', decodeJWT, materiaRoutes)
  router.use('/entregaPactada', decodeJWT, entregaPactadaRoutes)
  router.use('/grupo', decodeJWT, grupoRoutes)
  router.use('/entrega', decodeJWT, entregaRoutes)
  router.use('/inasistencia', decodeJWT, inasistenciaRoutes)
  router.use('/archivo', decodeJWT, archivoRoutes)
  router.use('/persona', decodeJWT, personaRoutes)
  router.use('/penalidad', decodeJWT, penalidadRoutes)
  return router
}

const rutasAuth = () => {
  const router = Router()
  router.use('/auth', authRoutes)
  return router
}

module.exports = { rutasInit, rutasAuth }
