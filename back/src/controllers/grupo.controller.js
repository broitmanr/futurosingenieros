const errors = require('../const/error')
const models = require('../database/models/index')
const { red, yellow } = require('picocolors')

// Función para crear una entrega
async function crear (req, res, next) {
  const {cursoID, nombre} = req.body

  const curso = await models.Curso.findByPk(cursoID);
  if (!curso){
    return next(errors.NotFoundError)
  }

  if (res.locals.usuario.persona_id == null) { return next(errors.UsuarioNoPersona) }
  const grupoPersona = await models.PersonaXGrupo.findOne({
    include: [{
      model: models.Grupo,
      where: { curso_id:cursoID },  // Condición de que el grupo pertenezca al curso
      attributes: []  // No necesitamos atributos de Grupo, solo la relación
    }],
    where:{
      persona_ID:res.locals.usuario.persona_id,
    }
  })

  const alumno = await models.PersonaXCurso.findOne({
    where: { persona_id: res.locals.usuario.persona_id, curso_id: cursoID, rol: 'A' }
  })
  if (!alumno){
    return next({ ...errors.CredencialesInvalidas, details: `No tienes acceso a este curso` })

  }

  if (grupoPersona) {
    return next({ ...errors.ConflictError, details: `El usuario ya tiene un grupo asociado a este curso` })
  }

  const cantidadGrupos = await models.Grupo.count({ where: { curso_id:cursoID } });
  const nuevoNumero = cantidadGrupos + 1;

  const transaction = await models.sequelize.transaction()

  try {
    const grupo = await models.Grupo.create({
      curso_id: cursoID,
      nombre,
      numero:nuevoNumero,
      updated_by: res.locals.usuario.ID
    }, { transaction })

    await models.PersonaXGrupo.create({
      persona_ID: res.locals.usuario.persona_id,
      grupo_ID: grupo.ID,
      updated_by: res.locals.usuario.ID
    }, { transaction })

    await transaction.commit()
    // Responder con el curso creado
    res.status(201).json(grupo)
  } catch (error) {
    await transaction.rollback()
    console.error(red(`Error al crear el grupo:${error}`))
    return next(errors.FaltanCampos)
  }
}

async function addToGroup(req, res, next) {
  const {grupoID, legajo} = req.body
  console.log(grupoID)

  const grupo = await models.Grupo.findByPk(grupoID);
  if (!grupo){
    return next({ ...errors.NotFoundError, details: `No se encontro ese grupo` })
  }
  if (res.locals.usuario.persona_id == null) { return next(errors.UsuarioNoPersona) }

  const persona = await models.Persona.findOne({
    where:{
      legajo,
      rol:'A'
    }
  })
  console.log(persona)
  if (!persona){
    return next({ ...errors.NotFoundError, details: `No se encontro alumno con este legajo` })
  }

  const personaXCurso = await models.PersonaXCurso.findOne({
    where:{
      curso_id:grupo.curso_id,
      rol:'A',
      persona_id:persona.ID,
    }
  })
  if (!personaXCurso){
    return next({ ...errors.ConflictError, details: `No se puede añadir a ${persona.nombre} ${persona.apellido} por no pertenecer al curso` })
  }

    const grupoPersona = await models.PersonaXGrupo.findOne({
      include: [{
        model: models.Grupo,
        where: { curso_id:grupo.curso_id },  // Condición de que el grupo pertenezca al curso
        attributes: []  // No necesitamos atributos de Grupo, solo la relación
      }],
      where:{
        persona_ID:persona.ID,
      }
    })


    const alumno = await models.PersonaXCurso.findOne({
      where: { persona_id: res.locals.usuario.persona_id, curso_id: grupo.curso_id, rol: 'A' }
    })
    if (!alumno){
      return next({ ...errors.CredencialesInvalidas, details: `No tienes acceso a este curso` })

    }

    if (grupoPersona) {
      return next({ ...errors.ConflictError, details: `La persona ya tiene un grupo asociado a este curso` })
    }


    const transaction = await models.sequelize.transaction()

    try {


      await models.PersonaXGrupo.create({
        persona_ID: persona.ID,
        grupo_ID: grupo.ID,
        updated_by: res.locals.usuario.ID
      }, { transaction })

      await transaction.commit()
      // Responder con el curso creado
      res.status(201).json(grupo)
  } catch (error) {
    await transaction.rollback()
    console.error(red(`Error al crear el grupo:${error}`))
    return next(errors.FaltanCampos)
  }
}

async function ver (req, res, next) {
  const { id } = req.params
  try {
    const grupo = await models.Grupo.findOne({
      where: {
        id
      },
      include: [
        {
          model: models.Persona,
          attributes:['ID','rol','dni','legajo','apellido','nombre']

        },
        {
          model: models.Curso,
          include:[
            {
              model:models.Materia,
              attributes:['ID','nombre','anio']
            }
          ],attributes:['ID','cicloLectivo']
        }
      ],
      attributes:['ID','numero','nombre','curso_id']
    })

    if (!grupo) {
      console.warn(yellow(`Advertencia: grupo con ID ${id} no encontrado.`))
      next({ ...errors.NotFoundError, details: `grupo con ID ${id} no encontrada` })
    }

    res.status(200).json(grupo)
  } catch (error) {
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener el grupo: ' + error.message
    })
  }
}

async function listar (req, res, next) {
  try {
    if (req.params == null) { return next(errors.CredencialesInvalidas) }
    const curso = req.params.cursoID
    const grupos = await models.Grupo.findAll({
      where: {
        curso_id: curso
      },
      include: [
        {
          model: models.Persona,
          attributes:['ID','rol','dni','legajo','apellido','nombre']

        },
        {
          model: models.Curso,
          include:[
            {
              model:models.Materia,
              attributes:['ID','nombre','anio']
            }
          ],attributes:['ID','cicloLectivo']
        }
      ],
      attributes:['ID','numero','nombre','curso_id']
    })
    if (grupos.length == 0){return next({...errors.NotFoundError,details:'No se encontraron grupos para ese curso'})}
    res.status(200).json(grupos)
  } catch (error) {
    next({
      ...errors.InternalServerError,
      details: 'Error al listar los grupos de un curso:' + error.message
    })
  }
}

// async function listarTiposInstancias (req, res, next) {
//   try {
//     // Agregar validar que sea los q el es docente
//     const tiposinstancias = await models.TipoInstancia.findAll({
//       attributes: ['ID', 'nombre', 'descripcion']
//     })
//
//     res.status(200).json(tiposinstancias)
//   } catch (error) {
//     console.error(red('Error al listar los tipos de instancias', error))
//     next({
//       ...errors.InternalServerError,
//       details: 'Error al listar los tipos de instancias' + error.message
//     })
//   }
// }

module.exports = {
  crear,addToGroup,ver,listar
}
