const models = require('../database/models/index')
const error = require('../const/error')
const usuarioController = {
  listar: async (req, res) => {
    const users = await models.usuario.findAll()

    res.json({
      success: true,
      data: {
        usuarios: users
      }
    })
  },

  crear: async (req, res, next) => {

  },
  MiPerfil: async (req, res, next) => {
    const usuario = res.locals.usuario
    const dataPersona = await models.Persona.findOne({
      where: {
        ID: usuario.persona_id
      }
    })
    if (!dataPersona) {
      return next({ ...error.NotFoundError, details: 'No se encontró la persona asociada al usuario en el metodo MiPerfil' })
    }
    res.json({
      success: true,
      data: {
        usuarioId: usuario.ID,
        email: usuario.mail,
        personaId: dataPersona.ID,
        nombre: dataPersona.nombre,
        apellido: dataPersona.apellido,
        legajo: dataPersona.legajo,
        dni: dataPersona.dni,
        rol: dataPersona.rol
      }
    })
  }
}

module.exports = usuarioController
