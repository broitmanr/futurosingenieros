const errors = require('../const/error')
const models = require('../database/models/index')

async function crear(tipo, texto, personaId) {

}

async function obtenerUltimasNotificaciones(req, res, next) {
  const usuarioId = res.locals.usuario.ID // Suponiendo que tienes la ID del usuario en req.user
  try {
    const notificaciones = await models.Notificacion.findAll({
      where: { usuario_id: usuarioId },
      order: [['fecha', 'DESC']],
      limit: 5 // Limitar a las últimas 5 notificaciones
    })
    console.log(notificaciones)
    return res.status(200).json(notificaciones)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error al obtener las notificaciones' })
  }
}

async function marcarLeido(req, res, next) {
  const usuarioId = res.locals.usuario.ID // Suponiendo que tienes la ID del usuario en req.user
  const { id } = req.params
  if (!id) {
    return next({ ...errors.FaltanParametros })
  }
  try {
    const notificacion = await models.Notificacion.findByPk(id)
    if (!notificacion) {
      return next({ ...errors.NotFoundError })
    }
    if (notificacion.usuario_id !== usuarioId) {
      return next({ ...errors.UsuarioNoAutorizado, detail: 'La notificacion no pertenece al usuario' })
    }
    notificacion.leido = true
    await notificacion.save()
    return res.status(200).json({ message: 'Notificación marcada como leída' })
  } catch (error) {
    console.error(error)
    return next({ ...errors.InternalServerError })
  }
}

// Método simple para validar la carga de la ruta
async function testRoute(req, res) {
  return res.status(200).json({ message: 'Ruta de prueba funcionando correctamente' })
}

module.exports = {
  crear,
  obtenerUltimasNotificaciones,
  marcarLeido,
  testRoute

}
