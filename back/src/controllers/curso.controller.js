const errors = require('../const/error')
const { red, yellow } = require('picocolors')
const models = require('../database/models/index')
const generador = require('../services/generadores')

// Función para crear un curso
async function crear (req, res, next) {
  // Obtener los datos del cuerpo de la solicitud
  const { cicloLectivo, materiaID, comisionID } = req.body
  const transaction = await models.sequelize.transaction()
  // Si el usuario no tiene persona asociada entonces no puede crear el curso
  if (res.locals.usuario.persona_id == null) { return next(errors.UsuarioNoPersona) }
  try {
    const nuevoCurso = await models.Curso.create({
      cicloLectivo,
      materia_id: materiaID,
      comision_id: comisionID,
      updated_by: res.locals.usuario.ID,
      codigoVinculacion: null
    }, { transaction })

    await models.PersonaXCurso.create({
      persona_id: res.locals.usuario.persona_id,
      curso_id: nuevoCurso.ID,
      rol: res.locals.usuario.rol,
      updated_by: res.locals.usuario.ID
    }, { transaction })

    await transaction.commit()
    // Responder con el curso creado
    res.status(201).json(nuevoCurso)
  } catch (error) {
    await transaction.rollback()
    console.error(red('Error al crear el curso:', error))
    return next(errors.FaltanCampos)
  }
}

async function ver (req, res, next) {
  const { id } = req.params

  try {
    const cursoVer = await models.Curso.findOne({
      where: {
        id
      },
      include: [
        {
          model: models.Materia
          // attributes: ['ID', 'nombre'] // Ajusta los atributos según tus necesidades
        },
        {
          model: models.Comision,
          attributes: ['ID', 'nombre'] // Ajusta los atributos según tus necesidades
        },
        {
          model: models.PersonaXCurso,
          include: [
            {
              model: models.Persona,
              attributes: ['ID', 'nombre', 'apellido'] // Ajusta los atributos según tus necesidades
            }
          ]
          // attributes: ['persona_id']
        }
      ]
    })

    if (!cursoVer) {
      console.warn(yellow(`Advertencia: Curso con ID ${id} no encontrado.`))
      return next({ ...errors.NotFoundError, details: 'Curso no encontrado' })
    }

    res.status(200).json(cursoVer)
  } catch (error) {
    console.error(red('Error al obtener el curso:', error))
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener el curso: ' + error.message
    })
  }
}

async function listar (req, res, next) {
  try {
    // Agregar validar que sea los q el es docente
    const cursosIDs = await models.Curso.findAll({
      include: [
        {
          model: models.Comision,
          attributes: ['nombre']
        }, {
          model: models.Materia,
          attributes: ['nombre']
        }]

    })

    const cursosIDsComplete = cursosIDs.map(curso => ({
      id: curso.ID,
      anio: curso.cicloLectivo,
      comision: curso.Comision.nombre,
      materia: curso.Materium.nombre
    }))

    res.status(200).json(cursosIDsComplete)
  } catch (error) {
    console.error(red('Error al listar los cursosIDs:', error))
    next({
      ...errors.InternalServerError,
      details: 'Error al listar los cursosIDs: ' + error.message
    })
  }
}

async function generarCodigoVinculacion (req, res, next) {
  const { cursoId } = req.body
  const docenteId = res.locals.usuario.persona_id

  const transaction = await models.sequelize.transaction()

  try {
    const curso = await models.Curso.findByPk(cursoId, { transaction })

    if (!curso) {
      console.warn(yellow(`Advertencia: Curso con ID ${cursoId} no existe.`))
      return next({ ...errors.NotFoundError, details: `No se encontro ningun curso con ID ${cursoId}.` })
    }

    const esDocente = await models.PersonaXCurso.findOne({
      where: { persona_id: docenteId, curso_id: cursoId, rol: 'D' }
    })

    if (!esDocente) {
      console.warn(yellow(`Advertencia: Usuario con ID ${docenteId} no es docente del curso con ID ${cursoId}.`))
      return next({ ...errors.UsuarioNoAutorizado, details: 'No tienes permiso para generar el código de vinculación de este curso.' })
    }

    const codigoVinculacion = generador.generarCodigoAlfanumerico()
    await curso.update({ codigoVinculacion }, { transaction })
    await transaction.commit()
    res.json({
      codigoVinculacion,
      mensaje: 'Código de vinculación generado exitosamente'
    })
  } catch (error) {
    await transaction.rollback()
    console.error(red('Error al generar el código de vinculación:', error))
    next({
      ...errors.InternalServerError,
      details: 'Error al generar el código de vinculación: ' + error.message
    })
  }
}

async function vincularEstudiante (req, res, next) {
  const transaction = await models.sequelize.transaction()
  try {
    const { codigoVinculacion } = req.body
    const estudianteId = res.locals.usuario.persona_id

    if (!estudianteId) {
      await transaction.rollback()
      return next(errors.UsuarioNoPersona)
    }

    const curso = await models.Curso.findOne({
      where: { codigoVinculacion },
      transaction
    })

    if (!curso) {
      console.warn(yellow(`Advertencia: Código de vinculación ${codigoVinculacion} no encontrado en la base de datos.`))
      await transaction.rollback()
      return next({ ...errors.NotFoundError, details: `No se encontro ningun curso con el Código de vinculación ${codigoVinculacion}` })
    }

    const vinculacionExistente = await models.PersonaXCurso.findOne({
      where: { persona_id: estudianteId, curso_id: curso.ID },
      transaction
    })

    if (vinculacionExistente) {
      console.warn(yellow(`Advertencia: El estudiante con ID ${estudianteId} ya está vinculado al curso con ID ${curso.ID}.`))
      await transaction.rollback()
      return next({ ...errors.ConflictError, details: `El estudiante con ID ${estudianteId} ya está vinculado al curso con ID ${curso.ID}.` })
    }

    await models.PersonaXCurso.create({
      persona_id: estudianteId,
      curso_id: curso.ID,
      rol: 'A',
      updated_by: res.locals.usuario.ID
    }, { transaction })

    await transaction.commit()
    res.status(200).json({ message: 'Estudiante vinculado al curso exitosamente' })
  } catch (error) {
    await transaction.rollback()
    console.error(red('Error al vincular estudiante al curso:', error))
    next(error)
  }
}

// Funciones para gestion de estudiantes en un curso

async function agregarEstudiantes (req, res, next) {
  const { id } = req.params
  const { estudiantes } = req.body // `estudiantes` es un array de persona_id
  const transaction = await models.sequelize.transaction()
  const estudiantesDuplicados = []

  try {
    const curso = await models.Curso.findByPk(id, { transaction })
    if (!curso) return next({ ...errors.NotFoundError, details: 'Curso no encontrado' })

    const esDocente = await models.PersonaXCurso.findOne({
      where: { persona_id: res.locals.usuario.persona_id, curso_id: id, rol: 'D' }
    })
    if (!esDocente) return next(errors.UsuarioNoAutorizado)

    for (const estudianteId of estudiantes) {
      const vinculacionExistente = await models.PersonaXCurso.findOne({
        where: { persona_id: estudianteId, curso_id: id },
        transaction
      })

      if (!vinculacionExistente) {
        await models.PersonaXCurso.create({
          persona_id: estudianteId,
          curso_id: id,
          rol: 'A',
          updated_by: res.locals.usuario.ID
        }, { transaction })
      } else {
        console.warn(yellow(`Advertencia: El estudiante con ID ${estudianteId} ya está vinculado al curso con ID ${id}.`))
        estudiantesDuplicados.push(estudianteId)
      }
    }

    await transaction.commit()
    res.status(200).json({
      message: 'Estudiantes agregados exitosamente al curso',
      estudiantesDuplicados
    })
  } catch (error) {
    await transaction.rollback()
    console.error(red('Error al agregar estudiantes:', error))
    next({
      ...errors.InternalServerError,
      details: 'Error al agregar estudiantes: ' + error.message
    })
  }
}

async function verMiembrosCurso (req, res, next) {
  const { id } = req.params
  const { rol } = req.query

  try {
    const whereClause = { curso_id: id }
    if (rol) {
      whereClause.rol = rol // Si se proporciona el rol, agregarlo al filtro
    }

    const participantes = await models.PersonaXCurso.findAll({
      where: whereClause,
      include: [{ model: models.Persona, attributes: ['nombre', 'apellido', 'legajo'] }]
    })

    const formatoParticipantes = participantes.map(participante => ({
      ID: participante.ID,
      rol: participante.rol,
      persona_id: participante.persona_id,
      Persona: participante.Persona
    }))

    res.status(200).json(formatoParticipantes)
  } catch (error) {
    console.error(red('Error al obtener participantes:', error))
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener participantes: ' + error.message
    })
  }
}

async function agregarEstudianteByLegajo (req, res, next) {
  const { id } = req.params
  const { legajo } = req.body
  const transaction = await models.sequelize.transaction()

  try {
    const curso = await models.Curso.findByPk(id, { transaction })
    if (!curso) return next({ ...errors.NotFoundError, details: 'Curso no encontrado' })

    const estudiante = await models.Persona.findOne({
      where: {
        legajo,
        rol: 'A'
      }
    })
    if (!estudiante) return next({ ...errors.NotFoundError, details: 'Estudiante no encontrado' })

    // Verificar si el docente está asociado al curso
    const esDocente = await models.PersonaXCurso.findOne({
      where: { persona_id: res.locals.usuario.persona_id, curso_id: id, rol: 'D' }
    })

    if (!esDocente) {
      next(errors.UsuarioNoAutorizado)
    }

    const estudianteInCurso = await models.PersonaXCurso.findOne({
      where: {
        persona_id: estudiante.ID,
        curso_id: id
      }
    })

    if (estudianteInCurso) return next({ ...errors.ConflictError, details: 'El estudiante ya está en el curso' })

    await models.PersonaXCurso.create({
      persona_id: estudiante.ID,
      curso_id: id,
      rol: 'A',
      updated_by: res.locals.usuario.ID
    }, { transaction })

    await transaction.commit()
    res.status(201).json({ message: 'Alumno agregado al curso' })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

// Eliminar estudiantes de un curso
async function eliminarEstudiante (req, res, next) {
  const { id } = req.params
  const { estudiantes } = req.body // `estudiantes` es un array de persona_id
  const transaction = await models.sequelize.transaction()

  try {
    const curso = await models.Curso.findByPk(id, { transaction })
    if (!curso) {
      await transaction.rollback()
      return next({ ...errors.NotFoundError, details: `No se encontro ningun curso con este ID: ${id}` })
    }

    for (const estudianteId of estudiantes) {
      const estudiante = await models.PersonaXCurso.findOne({
        where: { persona_id: estudianteId, curso_id: id },
        transaction
      })

      if (!estudiante) {
        await transaction.rollback()
        return next({ ...errors.NotFoundError, details: `Estudiante con ID ${estudianteId} no encontrado en el curso` })
      }
      await estudiante.destroy({ transaction })
    }

    await transaction.commit()
    res.status(200).json({ message: 'Estudiantes eliminados del curso exitosamente' })
  } catch (error) {
    await transaction.rollback()
    console.error(red('Error al eliminar estudiantes del curso:', error))
    next(error)
  }
}

async function actualizar (req, res, next) {
  const { id } = req.params
  const { cicloLectivo, materiaID, comisionID } = req.body
  const transaction = await models.sequelize.transaction()
  const docenteId = res.locals.usuario.persona_id

  try {
    const curso = await models.Curso.findByPk(id, { transaction })
    if (!curso) return next({ ...errors.NotFoundError, details: 'No se encontro ningun curso con ese ID, por favor vuelva a intentar.' })
    // Verificar que el curso pertenece al docente logueado
    const esDocente = await models.PersonaXCurso.findOne({
      where: { persona_id: docenteId, curso_id: id, rol: 'D' },
      transaction
    })

    if (!esDocente) {
      await transaction.rollback()
      return next({ ...errors.UsuarioNoAutorizado, details: 'No tienes permiso para actualizar este curso.' })
    }

    // Actualizar los campos del curso
    await curso.update({
      cicloLectivo,
      materia_id: materiaID,
      comision_id: comisionID,
      updated_by: res.locals.usuario.ID
    }, { transaction })

    await transaction.commit()
    res.status(200).json({ message: 'Curso actualizado exitosamente' })
  } catch (error) {
    await transaction.rollback()
    console.error(red('Error al actualizar el curso:', error))
    next(error)
  }
}

async function eliminar (req, res, next) {
  const { cursosIDs } = req.body // `cursosIDs` es un array de IDs de cursos
  const transaction = await models.sequelize.transaction()
  const docenteId = res.locals.usuario.persona_id

  try {
    for (const cursoID of cursosIDs) {
      const curso = await models.Curso.findByPk(cursoID, { transaction })
      if (!curso) {
        await transaction.rollback()
        return next({ ...errors.NotFoundError, details: `Curso con ID ${cursoID} no encontrado` })
      }

      // Verificar que el curso pertenece al docente logueado
      const esDocente = await models.PersonaXCurso.findOne({
        where: { persona_id: docenteId, curso_id: cursoID, rol: 'D' },
        transaction
      })

      if (!esDocente) {
        await transaction.rollback()
        return next({ ...errors.UsuarioNoAutorizado, details: 'No tienes permiso para eliminar este curso.' })
      }

      // Eliminar el curso y todas las vinculaciones asociadas
      await models.PersonaXCurso.destroy({ where: { curso_id: cursoID }, transaction })
      await curso.destroy({ transaction })
    }

    await transaction.commit()
    res.status(200).json({ message: 'cursosIDs eliminados exitosamente' })
  } catch (error) {
    await transaction.rollback()
    console.error(red('Error al eliminar los cursosIDs:', error))
    next(error)
  }
}

module.exports = {
  crear,
  ver,
  listar,
  generarCodigoVinculacion,
  vincularEstudiante,
  agregarEstudiantes,
  verMiembrosCurso,
  eliminarEstudiante,
  actualizar,
  eliminar,
  agregarEstudianteByLegajo
}
