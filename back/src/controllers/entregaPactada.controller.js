const errors = require('../const/error')
const { red, yellow } = require('picocolors')
const { handleTransaction } = require('../const/transactionHelper')
const models = require('../database/models/index')
const { validarDocenteInstanciaEvaluativa } = require('../middlewares/validarDocente')
const { getEstado } = require('./entrega.controller')
const { crearNotificacionesParaAlumnos } = require('../services/notificacionService')

// Función para crear una entrega pactada
async function crear (req, res, next) {
  const { nombre, numero, descripcion, fechavto1, fechavto2, instanciaEvaluativaID } = req.body

  const nuevaEntregaPactada = await handleTransaction(async (transaction) => {
    // Crear la nueva entrega pactada
    const entrega = await models.EntregaPactada.create({
      nombre,
      numero,
      descripcion,
      fechavto1,
      fechavto2,
      instanciaEvaluativa_id: instanciaEvaluativaID,
      updated_by: res.locals.usuario.ID
    }, { transaction })

    // Obtener la instancia evaluativa y el curso asociado, con personas y usuarios
    const instanciaEvaluativa = await models.InstanciaEvaluativa.findByPk(instanciaEvaluativaID, {
      include: {
        model: models.Curso,
        include: [
          {
            model: models.Persona,
            where: { rol: 'A' },
            include: {
              model: models.Usuario,
              attributes: ['ID'] // Solo traer el ID del usuario
            }
          },
          {
            model: models.Materia,
            attributes: ['nombre']
          }
        ]
      }
    })

    if (!instanciaEvaluativa || !instanciaEvaluativa.Curso) {
      throw new Error('No se encontró el curso asociado a la instancia evaluativa')
    }

    // Obtener los IDs de usuarios de alumnos con cuenta de usuario asociada
    const usuarioIds = instanciaEvaluativa.Curso.Personas
      .filter(persona => persona.Usuario) // Filtrar personas que tienen un usuario asociado
      .map(persona => persona.Usuario.ID)

    // Crear mensaje de notificación
    const mensaje = ` ${instanciaEvaluativa.Curso.Materium.nombre} nueva entrega. Fecha de vencimiento: ${fechavto1}`

    // Llamar al servicio para crear las notificaciones
    await crearNotificacionesParaAlumnos(
      usuarioIds,
      mensaje,
      1,
      res.locals.usuario.ID,
      transaction
    )

    return entrega
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
          attributes: ['ID', 'nombre', 'descripcion', 'curso_id', 'grupo'],
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
    console.log('Entrega pactada encontrada:', JSON.stringify(entregaPactada, null, 2))
    res.status(200).json(entregaPactada)
  } catch (error) {
    console.error('Error al obtener la entrega pactada:', error)
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener la entrega pactada: ' + error.message
    })
  }
}

// Función para listar todas las entregas pactadas de una instancia evaluativa
async function listarEntregasInstancia (req, res, next) {
  const { instanciaID } = req.params
  // Se podria verificar que pertenezca el curso a la persona

  try {
    let entregasPactadas
    if (res.locals.usuario.rol === 'A') {
      entregasPactadas = await models.EntregaPactada.findAll({
        attributes: ['ID', 'nombre', 'numero', 'descripcion', 'fechavto1', 'fechavto2'],
        where: {
          instanciaEvaluativa_id: instanciaID
        },
        include: [
          {
            model: models.Entrega,
            required: false,
            include: [
              {
                model: models.PersonaXEntrega,
                where: { persona_id: res.locals.usuario.persona_id }
              }
            ]
          }
        ]
      })

      const estadosEntrega = []

      for (entrega of entregasPactadas) {
        estadosEntrega[entrega.ID] = await getEstado(entrega?.Entregas[0] ?? null)
      }

      const entregasMapeadas = entregasPactadas.map(entrega => ({
        ID: entrega.ID,
        nombre: entrega.nombre,
        numero: entrega.numero,
        descripcion: entrega.descripcion,
        fechavto1: entrega.fechavto1,
        fechavto2: entrega.fechavto2,
        nota: entrega?.Entregas[0]?.nota ?? null,
        estado: estadosEntrega[entrega.ID],
        fechaEntrega: entrega?.Entregas[0]?.fecha ?? null
      }))

      res.status(200).json(entregasMapeadas)
    } else {
      entregasPactadas = await models.EntregaPactada.findAll({
        attributes: ['ID', 'nombre', 'numero', 'descripcion', 'fechavto1', 'fechavto2'],
        where: {
          instanciaEvaluativa_id: instanciaID
        }
      })
      res.status(200).json(entregasPactadas)
    }
  } catch (error) {
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
  const { confirm } = req.query
  await handleTransaction(async (transaction) => {
    const entregaPactada = await models.EntregaPactada.findOne({
      where: { id },
      include: [
        {
          model: models.Entrega,
          attributes: ['ID']
        }
      ],
      transaction
    })

    if (!entregaPactada) {
      console.warn(yellow(`Advertencia: Entrega pactada con ID ${id} no encontrada.`))
      return next({ ...errors.NotFoundError, details: 'Entrega pactada no encontrada' })
    }

    if (entregaPactada.Entregas.length !== 0) {
      if (confirm === 'true') {
        // Eliminar todas las entregas asociadas si se ha confirmado -- OPCIONAL --
        await models.Entrega.destroy({
          where: { entregaPactada_ID: id },
          transaction
        })
      } else {
        return next({ ...errors.ConflictError, details: 'No se puede eliminar una entrega pactada con entregas asociadas sin confirmación...' })
      }
    }

    // Eliminar la entrega pactada
    await entregaPactada.destroy({ transaction })
    return res.status(204).send()
  }, next)
}

module.exports = {
  crear,
  ver,
  listarEntregasInstancia,
  actualizar,
  eliminar
}
