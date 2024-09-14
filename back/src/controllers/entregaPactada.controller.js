const errors = require('../const/error')
const { red, yellow } = require('picocolors')
const { handleTransaction } = require('../const/transactionHelper')
const models = require('../database/models/index')
const { validarDocenteInstanciaEvaluativa } = require('../middlewares/validarDocente')

// Función para crear una entrega pactada
async function crear (req, res, next) {
  const { nombre, numero, descripcion, fechavto1, fechavto2, instanciaEvaluativaID } = req.body
  const nuevaEntregaPactada = await handleTransaction(async (transaction) => {
    return await models.EntregaPactada.create({
      nombre,
      numero,
      descripcion,
      fechavto1,
      fechavto2,
      instanciaEvaluativa_id: instanciaEvaluativaID,
      updated_by: res.locals.usuario.ID
    }, { transaction })
  }, next)

  if (nuevaEntregaPactada) {
    res.status(201).json({ message: 'EntregaPactada generada exitosamente', data: nuevaEntregaPactada })
  }
}

// Función para ver una entrega pactada
async function ver (req, res, next) {
  const { id } = req.params

  try {
    const entregaPactada = await models.EntregaPactada.findOne({
      where: { id },
      attributes: ['ID', 'nombre', 'numero', 'descripcion', 'fechavto1', 'fechavto2', 'instanciaEvaluativa_id'],
      include: [
        {
          model: models.InstanciaEvaluativa,
          attributes: ['ID', 'nombre', 'descripcion', 'curso_id'],
          include: [
            {
              model: models.Curso,
              attributes: ['ID', 'cicloLectivo'],
              include: [
                {
                  model: models.Materia,
                  attributes: ['nombre']
                },
                {
                  model: models.Comision,
                  attributes: ['nombre']
                }
              ]
            }
          ]
        }
      ]
    })

    if (!entregaPactada) {
      console.warn(`Advertencia: Entrega pactada con ID ${id} no encontrada.`)
      return next({ ...errors.NotFoundError, details: 'Entrega pactada no encontrada' })
    }

    res.status(200).json(entregaPactada)
  } catch (error) {
    console.error('Error al obtener la entrega pactada:', error)
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener la entrega pactada: ' + error.message
    })
  }
}

// Función para listar todas las entregas pactadas de un curso
async function listarEntregasCurso (req, res, next) {
  const { cursoId } = req.params
  console.log('Valor que llega del id en el params', cursoId)
  try {
    const entregasPactadas = await models.EntregaPactada.findAll({
      attributes: ['ID', 'nombre', 'numero', 'descripcion', 'fechavto1', 'fechavto2'],
      include: [
        {
          model: models.InstanciaEvaluativa,
          attributes: ['ID', 'curso_id'],
          where: { curso_id: cursoId },
          include: [
            {
              model: models.Curso,
              attributes: ['ID', 'cicloLectivo', 'materia_id', 'comision_id']
            }
          ]
        }
      ]
    })

    res.status(200).json(entregasPactadas)
  } catch (error) {
    console.error(red('Error al listar las entregas pactadas:', error))
    next({
      ...errors.InternalServerError,
      details: 'Error al listar las entregas pactadas: ' + error.message
    })
  }
}

// Función para actualizar una entrega pactada
async function actualizar (req, res, next) {
  const { id } = req.params
  const { nombre, numero, descripcion, fechavto1, fechavto2, instanciaEvaluativaID } = req.body

  try {
    await handleTransaction(async (transaction) => {
      const entregaPactada = await models.EntregaPactada.findOne({
        where: { id },
        attributes: ['ID', 'instanciaEvaluativa_id'],
        transaction
      })

      // Validar si el usuario tiene permisos sobre la nueva instancia evaluativa
      if (instanciaEvaluativaID !== entregaPactada.instanciaEvaluativa_id) {
        req.body.instanciaEvaluativaID = instanciaEvaluativaID
        const validacion = await validarDocenteInstanciaEvaluativa(req, res, next, true) // true porque no se quiere llamar a next en caso de error

        if (validacion && validacion.error) {
          await transaction.rollback() // Rollback de la transacción si no se tiene permisos sobre la instancia evaluativa o no se encuentra la instancia evaluativa en la base de datos
          return next(validacion.error)
        }
      }

      await entregaPactada.update({
        nombre,
        numero,
        descripcion,
        fechavto1,
        fechavto2,
        instanciaEvaluativa_id: instanciaEvaluativaID,
        updated_by: res.locals.usuario.ID
      }, { transaction })

      res.status(200).json(entregaPactada)
    }, next)
  } catch (error) {
    console.error(red('Error al actualizar la entrega pactada:', error))
    next({
      ...errors.InternalServerError,
      details: 'Error al actualizar la entrega pactada: ' + error.message
    })
  }
}

// Función para eliminar una entrega pactada
async function eliminar (req, res, next) {
  const { id } = req.params

  const entregaPactadaEliminada = await handleTransaction(async (transaction) => {
    const entregaPactada = await models.EntregaPactada.findByPk(id, {
      attributes: ['ID'],
      transaction
    })

    if (!entregaPactada) {
      console.warn(yellow(`Advertencia: Entrega pactada con ID ${id} no encontrada.`))
      await transaction.rollback()
      return next({ ...errors.NotFoundError, details: 'Entrega pactada no encontrada' })
    }

    await entregaPactada.destroy({ transaction })
    return entregaPactada
  }, next)

  if (entregaPactadaEliminada) {
    res.status(200).json({ message: 'Entrega pactada eliminada exitosamente' })
  }
}

module.exports = {
  crear,
  ver,
  listarEntregasCurso,
  actualizar,
  eliminar
}
