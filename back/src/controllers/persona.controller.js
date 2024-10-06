const errors = require('../const/error')
const models = require('../database/models/index')
const {yellow} = require("picocolors");



async function getByLegajoAndCurso (req, res, next) {
  const { legajo, curso } = req.params
  // Verificar si perteneces al curso
  try {
    const personaXCurso = await models.PersonaXCurso.findOne({
      where: {
        curso_id:curso
      },
      include: [
        {
          model: models.Persona,
          where:{
            legajo,
            rol:'A',
          },
          attributes: ['ID', 'rol', 'dni', 'legajo', 'apellido', 'nombre']

        },
      ],
      attributes: ['ID']
    })

    if (!personaXCurso){
      next({ ...errors.NotFoundError, details: `No se encontro el alumno en ese curso` })
    }

    const grupo = await models.PersonaXGrupo.findOne({
      where: {
        persona_id:personaXCurso.Persona.ID
      },
      include:[
        {model:models.Grupo,
          where:{
           curso_id:curso
          }
        }
      ],
      attributes: ['ID']
    })

    if (grupo){
      next({ ...errors.ConflictError, details: `La persona buscada ya tiene un grupo en este curso` })
    }



    res.status(200).json(personaXCurso.Persona)
  } catch (error) {
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener el grupo: ' + error.message
    })
  }
}

module.exports = {
  getByLegajoAndCurso
}