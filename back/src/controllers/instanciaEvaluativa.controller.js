const errors = require('../const/error')
const models = require('../database/models/index')
const { red, yellow } = require('picocolors')

// Función para crear una entrega
async function crear (req, res, next) {
  const { porcentajePonderacion, cursoID, nombre, tipoInstanciaID, descripcion, grupo, penalidad_aplicable } = req.body
  const transaction = await models.sequelize.transaction()
  // Si el usuario no tiene persona asociada entonces no puede crear el curso
  if (res.locals.usuario.persona_id == null) { return next(errors.UsuarioNoPersona) }

  // Verifico que no sea mayor a 100
  const instancias = await models.InstanciaEvaluativa.findAll({
    where: { curso_id: cursoID }, // Ajusta el nombre del campo según tu modelo
    attributes: ['porcentaje_ponderacion']
  })

  const totalPonderacion = instancias.reduce((acc, instancia) => {
    return acc + instancia.porcentaje_ponderacion
  }, 0)

  if (totalPonderacion + parseInt(porcentajePonderacion) > 100) {
    return next({ ...errors.ConflictError, details: 'El porcentaje de ponderación de las instancias supera el 100%, haga los cambios e intente nuevamente' })
  }

  try {
    const nuevaInstancia = await models.InstanciaEvaluativa.create({
      porcentaje_ponderacion: porcentajePonderacion,
      curso_id: cursoID,
      nombre,
      descripcion,
      grupo,
      tipoInstancia_id: tipoInstanciaID,
      updated_by: res.locals.usuario.ID,
      penalidad_aplicable
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
      next({ ...errors.NotFoundError, details: `Instancia con ID ${id} no encontrada` })
    }

    res.status(200).json(instanciaVer)
  } catch (error) {
    console.error(red('Error al obtener el instancia:', error))
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener la instancia: ' + error.message
    })
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
    console.error(red('Error al listar las instancias de un curso:', error))
    next({
      ...errors.InternalServerError,
      details: 'Error al listar las instancias de un curso:' + error.message
    })
  }
}

async function listarTiposInstancias (req, res, next) {
  try {
    // Agregar validar que sea los q el es docente
    const tiposinstancias = await models.TipoInstancia.findAll({
      attributes: ['ID', 'nombre', 'descripcion']
    })

    res.status(200).json(tiposinstancias)
  } catch (error) {
    console.error(red('Error al listar los tipos de instancias', error))
    next({
      ...errors.InternalServerError,
      details: 'Error al listar los tipos de instancias' + error.message
    })
  }
}

async function remove (req, res, next) {
  if (req.params == null) { return next(errors.FaltanParametros) }
  const { id } = req.params
  try {
    const instanciaEliminar = await models.InstanciaEvaluativa.findOne({
      where: {
        id
      },
      include: [
        {
          model: models.TipoInstancia,
          attributes: ['ID', 'nombre']
        },
        {
          model: models.EntregaPactada,
          attributes: ['ID']
        }
      ]
    })
    // Todo: eliminar solo si es dueño de la instancia

    if (!instanciaEliminar) {
      console.warn(yellow(`Advertencia: Instancia con ID ${id} no encontrado.`))
      next({ ...errors.NotFoundError, details: `Instancia con ID ${id} no encontrada` })
    }

    if (instanciaEliminar.EntregaPactadas.length !== 0) {
      return next({ ...errors.ConflictError, details: 'No se puede eliminar una instancia con entregas pactadas' })
    } else {
      instanciaEliminar.destroy()
      return res.status(204).send()
    }
  } catch (error) {
    console.error(red('Error al eliminar instancia:', error))
    next({
      ...errors.InternalServerError,
      details: 'Error al eliminar la instancia: ' + error.message
    })
  }
}

async function edit (req, res, next) {
  if (req.params == null) { return next(errors.FaltanParametros) }
  const { id } = req.params
  try {
    const instancia = await models.InstanciaEvaluativa.findByPk(id, {

      include: [
        {
          model: models.Curso,
          attributes: ['ID']
        },
        {
          model: models.EntregaPactada,
          attributes: ['ID']
        }
      ]
    })

    if (!instancia) {
      next({ ...errors.NotFoundError, details: `Instancia con ID ${id} no encontrada` })
    }

    if (!await instancia.Curso.esDocente(res.locals.usuario.persona_id)) {
      next({ ...errors.UsuarioNoAutorizado, details: 'No es dueño de esa instancia' })
    }
    const { porcentajePonderacion, nombre, tipoInstanciaID, descripcion, grupo, penalidad_aplicable } = req.body
    const transaction = await models.sequelize.transaction()
    const instancias = await models.InstanciaEvaluativa.findAll({
      where: { curso_id: instancia.Curso.ID }, // Ajusta el nombre del campo según tu modelo
      attributes: ['porcentaje_ponderacion']
    })

    const totalPonderacion = instancias.reduce((acc, instancia) => {
      return acc + instancia.porcentaje_ponderacion
    }, 0)

    if (totalPonderacion - instancia.porcentaje_ponderacion + parseInt(porcentajePonderacion) > 100) {
      return next({ ...errors.ConflictError, details: 'El porcentaje de ponderación de las instancias supera el 100%, haga los cambios e intente nuevamente' })
    }

    if ((instancia.grupo !== grupo || instancia.penalidad_aplicable !== penalidad_aplicable) &&
    instancia.EntregaPactadas.length !== 0
    ) {
      return next({ ...errors.ConflictError, details: 'No puede cambiar grupal o aplica penalidad si existen entregas pactadas' })
    }

    try {
      instancia.update({
        porcentaje_ponderacion: porcentajePonderacion,
        nombre,
        descripcion,
        grupo,
        tipoInstancia_id: tipoInstanciaID,
        updated_by: res.locals.usuario.ID,
        penalidad_aplicable
      }, { transaction })

      await instancia.save({ transaction })
      await transaction.commit()
      // Responder con el curso creado
      res.status(200).json(instancia)
    } catch (error) {
      await transaction.rollback()
      console.error(red(`Error al modificar la instancia:${error}`))
      return next(errors.FaltanCampos)
    }
  } catch (error) {
    console.error(red('Error al modificar instancia:', error))
    next({
      ...errors.InternalServerError,
      details: 'Error al modificar la instancia: ' + error.message
    })
  }
}

module.exports = {
  crear, listarTiposInstancias, listar, ver, remove, edit
}
