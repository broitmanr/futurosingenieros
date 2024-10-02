const errors = require('../const/error')
const models = require('../database/models/index')
const { red, yellow } = require('picocolors')

async function registrarInasistencias (req, res, next) {
  const { curso_id } = req.params
  const inasistencias = req.body.inasistencias // Esto sería un objeto alumno_id: cantidad_inasistencias

  console.log(curso_id, inasistencias)
  try {
    // Verificar que el curso existe
    const curso = await models.Curso.findByPk(curso_id)
    if (!curso) {
      return next({ ...errors.NotFoundError, details: 'Curso no encontrado' })
    }

    const docente = await models.PersonaXCurso.findOne({
      where: {
        curso_id,
        rol: 'D',
        persona_id: res.locals.usuario.persona_id
      }
    })
    if (!docente) { return next({ ...errors.UsuarioNoAutorizado, details: 'Este curso no le pertenece' }) }

    // Validar que los alumno_id son correctos y pertenecen a este curso
    const alumnosIds = Object.keys(inasistencias) // Obtener los alumno_id del body
    const alumnosValidos = await models.PersonaXCurso.findAll({
      where: {
        curso_id,
        persona_id: alumnosIds
      }
    })

    // Verificar que todos los alumnos enviados pertenecen al curso
    if (alumnosValidos.length !== alumnosIds.length) {
      return next({ ...errors.NotFoundError, details: 'Algunos alumnos no pertenecen al curso' })
    }

    // Registrar o actualizar las inasistencias
    for (const [persona_id, cantidad] of Object.entries(inasistencias)) {
      // Buscar o crear registro de inasistencias para ese alumno en ese curso
      await models.Inasistencia.upsert({
        persona_id,
        curso_id,
        cantidad
      })
    }

    res.status(200).json({ message: 'Inasistencias registradas correctamente' })
  } catch (error) {
    console.error(error)
    next({ ...errors, details: 'Ocurrio un error al registrar inasistencias' })
  }
};

module.exports = {
  registrarInasistencias
}
