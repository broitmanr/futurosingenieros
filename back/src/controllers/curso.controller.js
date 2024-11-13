const errors = require('../const/error')
const { red, yellow } = require('picocolors')
const models = require('../database/models/index')
const generador = require('../services/generadores')
const { join } = require('path')
const xlsx = require('xlsx')
const fs = require('fs')
const { handleTransaction } = require('../const/transactionHelper')
// Función para crear un curso
async function crear (req, res, next) {
  // Obtener los datos del cuerpo de la solicitud
  const { cicloLectivo, materiaID, comisionID } = req.body
  const transaction = await models.sequelize.transaction()
  // Si el usuario no tiene persona asociada entonces no puede crear el curso
  if (res.locals.usuario.persona_id == null) { return next(errors.UsuarioNoPersona) }
  try {
    // Verificamos si ya existe un curso con los mismos datos de ciclo lectivo, materia y comisión
    const cursoExistente = await models.Curso.findOne({
      where: {
        cicloLectivo,
        materia_id: materiaID,
        comision_id: comisionID
      }
    })
    if (cursoExistente) {
      console.warn(yellow(`Advertencia: Ya existe un curso con esos datos, con ID ${cursoExistente.id}`))
      return next({ ...errors.ConflictError, details: `Ya existe un curso con esos datos, cursoExistente: ${cursoExistente}` })
    }
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
    console.error('Error al crear el curso:', error.message)
    return next(errors.FaltanCampos)
  }
}

async function ver (req, res, next) {
  const { id } = req.params

  try {
    const cursoVer = await models.CursoConDetalle.findByPk(id, {
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

    // const instancias = await models.InstanciaEvaluativa.findAll({
    //   where: { curso_id: cursoVer.ID }, // Ajusta el nombre del campo según tu modelo
    //   attributes: ['porcentaje_ponderacion']
    // })
    //
    // // Sumar los porcentajes de ponderación de las instancias evaluativas
    // const totalPonderacion = instancias.reduce((acc, instancia) => {
    //   return acc + instancia.porcentaje_ponderacion
    // }, 0)

    // Añadir el total de ponderación al objeto de respuesta
    // const response = {
    //   ...cursoVer.toJSON(),
    //   totalPonderacion
    // }

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
    const usuarioRol = res.locals.usuario.rol
    let cursos

    if (usuarioRol === 'D') {
      const docenteId = res.locals.usuario.persona_id
      cursos = await models.Curso.findAll({
        include: [
          {
            model: models.Comision,
            attributes: ['nombre']
          }, {
            model: models.Materia,
            attributes: ['nombre', 'imagen']
          }, {
            model: models.PersonaXCurso,
            where: { persona_id: docenteId },
            attributes: []
          }
        ]
      })
    } else if (usuarioRol === 'A') {
      const estudianteId = res.locals.usuario.persona_id
      cursos = await models.Curso.findAll({
        include: [
          {
            model: models.Comision,
            attributes: ['nombre']
          }, {
            model: models.Materia,
            attributes: ['nombre', 'imagen']
          }, {
            model: models.PersonaXCurso,
            where: { persona_id: estudianteId },
            attributes: []
          }
        ]
      })
    } else {
      next({ ...errors.UsuarioNoAutorizado, details: 'No tiene permiso para listar los cursos.' })
    }

    const cursosIDsComplete = cursos.map(curso => ({
      id: curso.ID,
      anio: curso.cicloLectivo,
      comision: curso.Comision.nombre,
      materia: curso.Materium.nombre,
      image: `${req.protocol}://${req.get('host')}/api/archivo/imagen/nombre/${curso.Materium.imagen ?? 'generica'}`
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
    res.status(201).json({
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
    const AlumnoId = res.locals.usuario.persona_id

    if (!AlumnoId) {
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
      where: { persona_id: AlumnoId, curso_id: curso.ID },
      transaction
    })

    if (vinculacionExistente) {
      console.warn(yellow(`Advertencia: El Alumno con ID ${AlumnoId} ya está vinculado al curso con ID ${curso.ID}.`))
      await transaction.rollback()
      return next({ ...errors.ConflictError, details: `El Alumno con ID ${AlumnoId} ya está vinculado al curso con ID ${curso.ID}.` })
    }

    await models.PersonaXCurso.create({
      persona_id: AlumnoId,
      curso_id: curso.ID,
      rol: 'A',
      updated_by: res.locals.usuario.ID
    }, { transaction })

    await transaction.commit()
    res.status(200).json({ message: 'Estudiante vinculado al curso exitosamente' })
  } catch (error) {
    await transaction.rollback()
    console.error(red('Error al vincular Alumno al curso:', error))
    next({ ...errors.InternalServerError, details: 'Error al vincular Alumno al curso: ' + error.message })
  }
}

// Funciones para gestion de Alumnos en un curso

async function agregarEstudiantes (req, res, next) {
  const { id } = req.params
  const { Alumnos } = req.body // `Alumnos` es un array de persona_id
  const transaction = await models.sequelize.transaction()
  const AlumnosDuplicados = []

  try {
    const curso = await models.Curso.findByPk(id, { transaction })
    if (!curso) return next({ ...errors.NotFoundError, details: 'Curso no encontrado' })

    const esDocente = await models.PersonaXCurso.findOne({
      where: { persona_id: res.locals.usuario.persona_id, curso_id: id, rol: 'D' }
    })
    if (!esDocente) return next(errors.UsuarioNoAutorizado)

    for (const AlumnoId of Alumnos) {
      const vinculacionExistente = await models.PersonaXCurso.findOne({
        where: { persona_id: AlumnoId, curso_id: id },
        transaction
      })

      if (!vinculacionExistente) {
        await models.PersonaXCurso.create({
          persona_id: AlumnoId,
          curso_id: id,
          rol: 'A',
          updated_by: res.locals.usuario.ID
        }, { transaction })
      } else {
        console.warn(yellow(`Advertencia: El Alumno con ID ${AlumnoId} ya está vinculado al curso con ID ${id}.`))
        AlumnosDuplicados.push(AlumnoId)
      }
    }

    await transaction.commit()
    res.status(200).json({
      message: 'Alumnos agregados exitosamente al curso',
      AlumnosDuplicados
    })
  } catch (error) {
    await transaction.rollback()
    console.error(red('Error al agregar Alumnos:', error))
    next({
      ...errors.InternalServerError,
      details: 'Error al agregar Alumnos: ' + error.message
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
      include: [
        {
          model: models.Persona,
          attributes: ['nombre', 'apellido', 'legajo'],
          include: [
            {
              model: models.Usuario,
              attributes: ['mail']
            },
            {
              model: models.InasistenciasPorCurso, // Incluir la vista aquí
              attributes: ['total_inasistencias'], // Atributos que necesitas de la vista
              required: false, // Permitir que las personas sin inasistencias aún sean incluidas
              where: { curso_id: id } // Filtrar por curso_id
            }
          ]
        }
      ]
    })

    const formatoParticipantes = participantes.map(participante => {
      const persona = participante.Persona.get({ plain: true })
      const totalInasistencias = persona.InasistenciasPorCursos.length > 0
        ? persona.InasistenciasPorCursos[0].total_inasistencias
        : 0 // Total inasistencias o 0 si no hay

      return {
        ID: participante.ID,
        rol: participante.rol,
        persona_id: participante.persona_id,
        Persona: {
          nombre: persona.nombre,
          apellido: persona.apellido,
          legajo: persona.legajo,
          mail: persona.Usuario ? persona.Usuario.mail : null, // Maneja el caso donde Usuario es null
          total_inasistencias: totalInasistencias // Asigna el total de inasistencias
        }
      }
    })

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
    if (!curso) {
      await transaction.rollback()
      return next({ ...errors.NotFoundError, details: 'Curso no encontrado' })
    }

    const Alumno = await models.Persona.findOne({
      where: {
        legajo,
        rol: 'A'
      },
      transaction
    })
    if (!Alumno) {
      await transaction.rollback()
      return next({ ...errors.NotFoundError, details: 'Estudiante no encontrado' })
    }

    // Verificar si el docente está asociado al curso
    const esDocente = await models.PersonaXCurso.findOne({
      where: { persona_id: res.locals.usuario.persona_id, curso_id: id, rol: 'D' },
      transaction
    })

    if (!esDocente) {
      await transaction.rollback()
      return next(errors.UsuarioNoAutorizado)
    }

    // Bloquear la fila para evitar condiciones de carrera
    const AlumnoInCurso = await models.PersonaXCurso.findOne({
      where: {
        persona_id: Alumno.ID,
        curso_id: id
      },
      lock: transaction.LOCK.UPDATE,
      transaction
    })

    if (AlumnoInCurso) {
      await transaction.rollback()
      return next({ ...errors.ConflictError, details: 'El Alumno ya está en el curso' })
    }

    await models.PersonaXCurso.create({
      persona_id: Alumno.ID,
      curso_id: id,
      rol: 'A',
      updated_by: res.locals.usuario.ID
    }, { transaction })

    await transaction.commit()
    res.status(201).json({ message: 'Alumno agregado al curso' })
  } catch (error) {
    await transaction.rollback()
    console.error(red('Error al agregar Alumno:', error))
    next({
      ...errors.InternalServerError,
      details: 'Error al agregar Alumno: ' + error.message
    })
  }
}

async function eliminarEstudiante (req, res, next) {
  const { id } = req.params
  console.log('ID del curso:', id)
  const { estudiantes } = req.body // `estudiantes` es un array de persona_id
  console.log('Estudiantes recibidos en el endpoint:', estudiantes)
  const transaction = await models.sequelize.transaction()

  try {
    const curso = await models.Curso.findByPk(id, { transaction })
    if (!curso) {
      await transaction.rollback()
      return next({ ...errors.NotFoundError, details: 'No se encontró ningún curso con este ID' })
    }

    for (const AlumnoId of estudiantes) {
      const Alumno = await models.PersonaXCurso.findOne({
        where: { persona_id: AlumnoId, curso_id: id },
        transaction
      })
      if (!Alumno) {
        await transaction.rollback()
        return next({ ...errors.NotFoundError, details: 'Estudiante no encontrado en el curso' })
      }

      // Verificar si el alumno tiene entregas asociadas en el curso específico
      const entregasAsociadas = await models.Entrega.findAll({
        include: [
          {
            model: models.EntregaPactada,
            include: [
              {
                model: models.InstanciaEvaluativa,
                where: { curso_id: id },
                attributes: ['ID', 'grupo']
              }
            ],
            attributes: ['ID'],
            required: true
          }
        ],
        where: { persona_id: AlumnoId },
        transaction
      })

      console.log('Entregas asociadas encontradas para el estudiante en el curso:', entregasAsociadas)

      // Verificar si alguna de las entregas es grupal o personal
      const entregasGrupales = entregasAsociadas.filter(entrega => entrega.EntregaPactada.InstanciaEvaluativa.grupo)
      const entregasPersonales = entregasAsociadas.filter(entrega => !entrega.EntregaPactada.InstanciaEvaluativa.grupo)

      console.log('Entregas grupales encontradas para el estudiante en el curso:', entregasGrupales)
      console.log('Entregas personales encontradas para el estudiante en el curso:', entregasPersonales)

      if (entregasGrupales.length > 0 || entregasPersonales.length > 0) {
        await transaction.rollback()
        return next({ ...errors.ConflictError, details: 'El estudiante tiene entregas asociadas en el curso y no puede ser eliminado' })
      }

      // Eliminar al estudiante del curso
      await models.PersonaXCurso.destroy({ where: { persona_id: AlumnoId, curso_id: id }, transaction })
    }

    await transaction.commit()
    res.status(204).send()
  } catch (error) {
    await transaction.rollback()
    console.error(red('Error al eliminar Alumnos del curso:', error))
    next({ ...errors.InternalServerError, details: 'Error al eliminar Alumnos del curso' })
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
    next({ ...errors.InternalServerError, details: 'Error al actualizar el curso: ' + error.message })
  }
}

// Función para eliminar un curso
async function eliminarCurso (req, res, next) {
  const { cursoId } = req.body
  const docenteId = res.locals.usuario.persona_id
  console.log('ID del curso:', cursoId)
  console.log('ID del docente:', docenteId)
  try {
    await handleTransaction(async (transaction) => {
      const cursoEliminar = await models.Curso.findOne({
        where: { ID: cursoId },
        include: [{ model: models.InstanciaEvaluativa, attributes: ['ID'] }],
        transaction
      })

      if (!cursoEliminar) {
        console.warn(yellow(`Advertencia: Curso con ID ${cursoId} no encontrado.`))
        return next({ ...errors.NotFoundError, details: 'No se encontró ningún curso' })
      }

      const esDocente = await models.PersonaXCurso.findOne({
        where: { persona_id: docenteId, curso_id: cursoId, rol: 'D' },
        transaction
      })

      if (!esDocente) {
        console.warn(yellow(`Advertencia: Usuario con ID ${docenteId} no es docente del curso con ID ${cursoId}.`))
        return next({ ...errors.UsuarioNoAutorizado, details: 'Usuario logueado actual no es docente del curso' })
      }

      // Verificar si hay grupos asociados al curso
      const gruposAsociados = await models.Grupo.findAll({
        where: { curso_id: cursoId },
        transaction
      })

      if (gruposAsociados.length > 0) {
        console.warn(yellow(`Advertencia: Curso con ID ${cursoId} tiene grupos asociados.`))
        return next({ ...errors.ConflictError, details: 'El curso tiene grupos asociados.' })
      }

      // Eliminar todas las instancias evaluativas y sus dependencias
      for (const instancia of cursoEliminar.InstanciaEvaluativas) {
        const entregasAsociadas = await models.Entrega.findAll({
          include: [
            {
              model: models.EntregaPactada,
              where: { instanciaEvaluativa_id: instancia.ID },
              attributes: ['ID']
            }
          ],
          transaction
        })

        if (entregasAsociadas.length > 0) {
          console.warn(yellow(`Advertencia: Curso con ID ${cursoId} tiene instancias evaluativas con entregas asociadas.`))
          return next({ ...errors.ConflictError, details: `Curso con ID ${cursoId} tiene instancias evaluativas con entregas asociadas.` })
        }

        await models.EntregaPactada.destroy({ where: { instanciaEvaluativa_id: instancia.ID }, transaction })
        await models.InstanciaEvaluativa.destroy({ where: { ID: instancia.ID }, transaction })
      }

      await models.PersonaXCurso.destroy({ where: { curso_id: cursoId }, transaction })
      await cursoEliminar.destroy({ transaction })
      console.log('Curso con ID:', cursoId + ' eliminado correctamente')
    }, next)
    return res.status(204).send()
  } catch (error) {
    console.error(red(`Error en la transacción: ${error}`))
    return next({
      ...errors.InternalServerError,
      details: 'Error en la transacción: ' + error.message
    })
  }
}
async function agregarEstudiantesExcel (req, res, next) {
  try {
    const cursoId = req.params.id
    const curso = await models.Curso.findByPk(cursoId)
    if (!curso) return next({ ...errors.NotFoundError, details: 'No se encontro ningun curso con ese ID, por favor vuelva a intentar.' })
    // Verificar que el curso pertenece al docente logueado
    const esDocente = await models.PersonaXCurso.findOne({
      where: { persona_id: res.locals.usuario.persona_id, curso_id: cursoId, rol: 'D' }
    })

    if (!esDocente) {
      return next({ ...errors.UsuarioNoAutorizado, details: 'No tienes permiso para generar el código de vinculación de este curso.' })
    }
    if (!req.file) {
      return next({ ...errors.CredencialesInvalidas, details: 'No se proporcionó ningún excel' })
    }

    // Ruta del archivo subido
    // const filePath = join(__dirname, '../../uploads/', req.file.filename);
    console.log('uuuurrñll', req.file.path)
    const filePath = req.file.path
    // Leer el archivo Excel
    const workbook = xlsx.readFile(filePath)
    const sheet = workbook.Sheets[workbook.SheetNames[0]] // Primera hoja del Excel
    const rows = xlsx.utils.sheet_to_json(sheet) // Convertir a JSON las filas

    const inexistentes = []
    const existentes = []
    // Procesar cada fila del Excel
    for (const row of rows) {
      const legajo = row.Legajo
      const nombres = row.Nombres // Este campo contiene "Apellido, Nombre"
      console.log(yellow(`Excel legajo: ${legajo} -- ${nombres} `))
      // Buscar el alumno por legajo
      const alumno = await models.Persona.findOne({ where: { legajo } })

      const [apellido, nombre] = nombres.split(',').map(part => part.trim())

      if (alumno) {
        const existeEnCurso = await models.PersonaXCurso.findOne({
          where: {
            persona_id: alumno.ID,
            curso_id: cursoId,
            rol: 'A'
          },
          include: [{ model: models.Persona }]
        })

        if (!existeEnCurso) {
          await models.PersonaXCurso.create({
            persona_id: alumno.ID,
            curso_id: cursoId,
            rol: 'A',
            updated_by: res.locals.usuario.ID
          })
        } else {
          const personaexiste = {
            nombre,
            apellido,
            legajo
          }
          existentes.push(personaexiste)
        }
      } else {
        const personaNoexiste = {
          nombre,
          apellido,
          legajo
        }
        inexistentes.push(personaNoexiste)
      }
    }

    // Elimina el archivo después de procesarlo
    fs.unlinkSync(filePath)

    // Responder al cliente indicando éxito
    res.status(200).json({ message: 'Archivo procesado correctamente y registros actualizados ', existentes, inexistentes })
  } catch (error) {
    console.error('Error al procesar el archivo Excel:', error)
    next({ ...errors.InternalServerError, details: 'Error al procesar el archivo Excel: ' + error.message })
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
  eliminarCurso,
  agregarEstudianteByLegajo,
  agregarEstudiantesExcel
}
