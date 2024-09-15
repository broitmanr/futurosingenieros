const errors = require('../const/error')
const models = require('../database/models/index')
const { red, yellow } = require('picocolors')

// Función para crear una entrega
async function crear (req, res, next) {
  const { porcentajePonderacion, cursoID, nombre, tipoInstanciaID, descripcion } = req.body
  const transaction = await models.sequelize.transaction()
  // Si el usuario no tiene persona asociada entonces no puede crear el curso
  if (res.locals.usuario.persona_id == null) { return next(errors.UsuarioNoPersona) }
  try {
    const nuevaInstancia = await models.InstanciaEvaluativa.create({
      porcentaje_ponderacion: porcentajePonderacion,
      curso_id: cursoID,
      nombre,
      descripcion,
      tipoInstancia_id: tipoInstanciaID,
      updated_by: res.locals.usuario.ID
    }, { transaction })

    // await models.PersonaXCurso.create({
    //   persona_id: res.locals.usuario.persona_id,
    //   curso_id: nuevoCurso.ID,
    //   rol: res.locals.usuario.rol,
    //   updated_by: res.locals.usuario.ID
    // }, { transaction })

    await transaction.commit()
    // Responder con el curso creado
    res.status(201).json(nuevaInstancia)
  } catch (error) {
    await transaction.rollback()
    console.error(red(`Error al crear el curso:${error}`))
    return next(errors.FaltanCampos)
  }
}

async function ver (req, res, next) {
  const { id } = req.params

  try {
    const instanciaVer = await models.InstanciaEvaluativa.findOne({
      where: {
        id
      },
      include: [
        {
          model: models.TipoInstancia,
          attributes: ['ID', 'nombre']
        }
      ]
    })

    if (!instanciaVer) {
      console.warn(yellow(`Advertencia: Instancia con ID ${id} no encontrado.`))
      return res.status(404).json({ error: 'Instancia no encontrado' })
    }

    res.status(200).json(instanciaVer)
  } catch (error) {
    console.error(red('Error al obtener el instancia:', error))
    res.status(500).json({ error: 'Error al obtener el instancia' })
  }
}

async function listar (req, res, next) {
  try {
    if (req.params == null) { return next(errors.CredencialesInvalidas) }
    const curso = req.params.cursoID
    const instanciasEvaluativas = await models.InstanciaEvaluativa.findAll({
      where: {
        curso_id: curso
      },
      include: [
        {
          model: models.TipoInstancia,
          attributes: ['ID', 'nombre']
        }
      ],
      attributes: [
        'ID',
        'nombre',
        'descripcion',
        'porcentaje_ponderacion'
      ]
      //
    })
    res.status(200).json(instanciasEvaluativas)
  } catch (error) {
    console.error(red('Error al listar las instancias:', error))
    // TODO: mandar como error
    res.status(500).json({ error: 'Error al listar las instancias' })
  }
}
//
// async function generarCodigoVinculacion (req, res, next) {
//   const { cursoId } = req.body
//   const docenteId = res.locals.usuario.persona_id
//   console.log(green(`ID recuperado del usuario logueado: ${docenteId}`))
//   console.log(green(`ID del curso recibido: ${cursoId}`))
//
//   const transaction = await models.sequelize.transaction()
//
//   try {
//     const curso = await models.Curso.findByPk(cursoId, { transaction })
//
//     if (!curso) {
//       console.warn(yellow(`Advertencia: Curso con ID ${cursoId} no existe.`))
//       return res.status(404).json({ error: 'Curso no encontrado' })
//     }
//
//     // Verificar si el docente está asociado al curso
//     const esDocente = await models.PersonaXCurso.findOne({
//       where: { persona_id: docenteId, curso_id: cursoId, rol: 'D' }
//     })
//
//     if (!esDocente) {
//       console.warn(yellow(`Advertencia: Usuario con ID ${docenteId} no es docente del curso con ID ${cursoId}.`))
//       return res.status(403).json({ error: 'No tienes permiso para generar un código para este curso' })
//     }
//
//     console.log(green(`El usuario logueado con ID ${docenteId} es docente del curso con ID ${cursoId}.`))
//
//     // El código de vinculación es el ID del curso en hexadecimal
//     const codigoVinculacion = crypto.randomBytes(4).toString('hex').toUpperCase()
//     await curso.update({ codigoVinculacion }, { transaction })
//     await transaction.commit()
//     console.log(blue(`Código de vinculación generado correctamente: ${codigoVinculacion}`))
//     res.json({
//       codigoVinculacion,
//       mensaje: 'Código de vinculación generado exitosamente'
//     })
//   } catch (error) {
//     await transaction.rollback()
//     console.error(red('Error al generar el código de vinculación:', error))
//     res.status(500).json({ error: 'Error al generar el código de vinculación' })
//   }
// }
//
//
// async function actualizar (req, res, next) {
//   const { id } = req.params
//   const { cicloLectivo, materiaID, comisionID } = req.body
//   const transaction = await models.sequelize.transaction()
//   const docenteId = res.locals.usuario.persona_id
//
//   try {
//     const curso = await models.Curso.findByPk(id, { transaction })
//     if (!curso) return res.status(404).json({ error: 'Curso no encontrado' })
//
//     // Verificar que el curso pertenece al docente logueado
//     const esDocente = await models.PersonaXCurso.findOne({
//       where: { persona_id: docenteId, curso_id: id, rol: 'D' },
//       transaction
//     })
//
//     if (!esDocente) {
//       await transaction.rollback()
//       return res.status(403).json({ error: 'No tienes permiso para actualizar este curso' })
//     }
//
//     // Actualizar los campos del curso
//     await curso.update({
//       cicloLectivo,
//       materia_id: materiaID,
//       comision_id: comisionID,
//       updated_by: res.locals.usuario.ID
//     }, { transaction })
//
//     await transaction.commit()
//     res.status(200).json({ message: 'Curso actualizado exitosamente' })
//   } catch (error) {
//     await transaction.rollback()
//     console.error(red('Error al actualizar el curso:', error))
//     next(error)
//   }
// }
//
// async function eliminar (req, res, next) {
//   const { cursosIDs } = req.body // `cursosIDs` es un array de IDs de cursos
//   const transaction = await models.sequelize.transaction()
//   const docenteId = res.locals.usuario.persona_id
//
//   try {
//     for (const cursoID of cursosIDs) {
//       const curso = await models.Curso.findByPk(cursoID, { transaction })
//       if (!curso) {
//         await transaction.rollback()
//         return res.status(404).json({ error: `Curso con ID ${cursoID} no encontrado` })
//       }
//
//       // Verificar que el curso pertenece al docente logueado
//       const esDocente = await models.PersonaXCurso.findOne({
//         where: { persona_id: docenteId, curso_id: cursoID, rol: 'D' },
//         transaction
//       })
//
//       if (!esDocente) {
//         await transaction.rollback()
//         return res.status(403).json({ error: `No tienes permiso para eliminar el curso con ID ${cursoID}` })
//       }
//
//       // Eliminar el curso y todas las vinculaciones asociadas
//       await models.PersonaXCurso.destroy({ where: { curso_id: cursoID }, transaction })
//       await curso.destroy({ transaction })
//     }
//
//     await transaction.commit()
//     res.status(200).json({ message: 'cursosIDs eliminados exitosamente' })
//   } catch (error) {
//     await transaction.rollback()
//     console.error(red('Error al eliminar los cursosIDs:', error))
//     next(error)
//   }
// }

async function listarTiposInstancias (req, res, next) {
  try {
    // Agregar validar que sea los q el es docente
    const tiposinstancias = await models.TipoInstancia.findAll({
      attributes: ['ID', 'nombre', 'descripcion']
    })

    res.status(200).json(tiposinstancias)
  } catch (error) {
    console.error(red('Error al listar los tipos de instancias', error))
    // TODO:mandar con error
    res.status(500).json({ error: 'Error al listar los tipos de instancias' })
  }
}

module.exports = {
  crear, listarTiposInstancias, listar, ver
}
