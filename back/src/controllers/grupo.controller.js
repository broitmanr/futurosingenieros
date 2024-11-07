const errors = require('../const/error')
const models = require('../database/models/index')
const { red, yellow } = require('picocolors')

// Función para crear una entrega
async function crear (req, res, next) {
  const { cursoID, nombreGrupo:nombre, legajos } = req.body

  // Validación del curso
  const curso = await models.Curso.findByPk(cursoID)
  if (!curso) {
    return next(errors.NotFoundError)
  }

  if (res.locals.usuario.persona_id == null) {
    return next(errors.UsuarioNoPersona)
  }

  // Verificar si el usuario ya tiene un grupo en este curso
  const grupoPersona = await models.PersonaXGrupo.findOne({
    include: [{
      model: models.Grupo,
      where: { curso_id: cursoID }, // Verificar si el grupo pertenece al curso
      attributes: [] // No necesitamos los atributos del grupo
    }],
    where: {
      persona_ID: res.locals.usuario.persona_id
    }
  })

  // Verificar si el usuario es un alumno en el curso
  const alumno = await models.PersonaXCurso.findOne({
    where: { persona_id: res.locals.usuario.persona_id, curso_id: cursoID, rol: 'A' }
  })
  if (!alumno) {
    return next({ ...errors.CredencialesInvalidas, details: 'No tienes acceso a este curso' })
  }

  // Si el usuario ya tiene un grupo asociado
  if (grupoPersona) {
    return next({ ...errors.ConflictError, details: 'El usuario ya tiene un grupo asociado a este curso' })
  }

  // Filtrar el legajo del creador si está en el array de legajos
  const legajosFiltrados = legajos.filter(legajo => legajo !== res.locals.usuario.persona_id)

  // Validar que ningún legajo filtrado esté asociado a un grupo en este curso
  const legajosExistentes = await models.PersonaXGrupo.findAll({
    include: [{
      model: models.Grupo,
      where: { curso_id: cursoID }, // Buscar grupos en el mismo curso
      attributes: []
    }],
    where: {
      persona_ID: legajosFiltrados // Verificamos los legajos filtrados
    }
  })

  if (legajosExistentes.length > 0) {
    return next({ ...errors.ConflictError, details: 'Algunos de los legajos ya están en un grupo en este curso' })
  }

  const cantidadGrupos = await models.Grupo.count({ where: { curso_id: cursoID } })
  const nuevoNumero = cantidadGrupos + 1

  // Iniciar una transacción
  const transaction = await models.sequelize.transaction()

  try {
    // Crear el nuevo grupo
    const grupo = await models.Grupo.create({
      curso_id: cursoID,
      nombre,
      numero: nuevoNumero,
      updated_by: res.locals.usuario.ID
    }, { transaction })

    // Asociar al creador del grupo con `PersonaXGrupo`
    await models.PersonaXGrupo.create({
      persona_ID: res.locals.usuario.persona_id,
      grupo_ID: grupo.ID,
      updated_by: res.locals.usuario.ID
    }, { transaction })

    // Asociar los legajos restantes al grupo
    const personaXGrupos = legajosFiltrados.map(legajo => ({
      persona_ID: legajo,
      grupo_ID: grupo.ID,
      updated_by: res.locals.usuario.ID
    }))

    await models.PersonaXGrupo.bulkCreate(personaXGrupos, { transaction })

    // Confirmar la transacción
    await transaction.commit()

    // Responder con el grupo creado
    res.status(201).json(grupo)
  } catch (error) {
    // Deshacer la transacción en caso de error
    await transaction.rollback()
    console.error(`Error al crear el grupo: ${error}`)
    return next(errors.FaltanCampos)
  }
}

async function addToGroup (req, res, next) {
  const { grupoID, legajo } = req.body
  console.log(grupoID)

  const grupo = await models.Grupo.findByPk(grupoID)
  if (!grupo) {
    return next({ ...errors.NotFoundError, details: 'No se encontro ese grupo' })
  }
  if (res.locals.usuario.persona_id == null) { return next(errors.UsuarioNoPersona) }

  const persona = await models.Persona.findOne({
    where: {
      legajo,
      rol: 'A'
    }
  })
  console.log(persona)
  if (!persona) {
    return next({ ...errors.NotFoundError, details: 'No se encontro alumno con este legajo' })
  }

  const personaXCurso = await models.PersonaXCurso.findOne({
    where: {
      curso_id: grupo.curso_id,
      rol: 'A',
      persona_id: persona.ID
    }
  })
  if (!personaXCurso) {
    return next({ ...errors.ConflictError, details: `No se puede añadir a ${persona.nombre} ${persona.apellido} por no pertenecer al curso` })
  }

  const grupoPersona = await models.PersonaXGrupo.findOne({
    include: [{
      model: models.Grupo,
      where: { curso_id: grupo.curso_id }, // Condición de que el grupo pertenezca al curso
      attributes: [] // No necesitamos atributos de Grupo, solo la relación
    }],
    where: {
      persona_ID: persona.ID
    }
  })

  const alumno = await models.PersonaXCurso.findOne({
    where: { persona_id: res.locals.usuario.persona_id, curso_id: grupo.curso_id, rol: 'A' }
  })
  if (!alumno) {
    return next({ ...errors.CredencialesInvalidas, details: 'No tienes acceso a este curso' })
  }

  if (grupoPersona) {
    return next({ ...errors.ConflictError, details: 'La persona ya tiene un grupo asociado a este curso' })
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
          attributes: ['ID', 'rol', 'dni', 'legajo', 'apellido', 'nombre']

        },
        {
          model: models.Curso,
          include: [
            {
              model: models.Materia,
              attributes: ['ID', 'nombre', 'anio']
            }
          ],
          attributes: ['ID', 'cicloLectivo']
        }
      ],
      attributes: ['ID', 'numero', 'nombre', 'curso_id']
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
          attributes: ['ID', 'rol', 'dni', 'legajo', 'apellido', 'nombre']

        },
        {
          model: models.Curso,
          include: [
            {
              model: models.Materia,
              attributes: ['ID', 'nombre', 'anio']
            }
          ],
          attributes: ['ID', 'cicloLectivo']
        }
      ],
      attributes: ['ID', 'numero', 'nombre', 'curso_id']
    })
    if (grupos.length === 0) { return next({ ...errors.NotFoundError, details: 'No se encontraron grupos para ese curso' }) }
    res.status(200).json(grupos)
  } catch (error) {
    next({
      ...errors.InternalServerError,
      details: 'Error al listar los grupos de un curso:' + error.message
    })
  }
}

// Modificar el endpoint de obtención de grupos
const verGrupoPorAlumno = async (req, res, next) => {
  const { curso_id } = req.params;
  const personaId = res.locals.usuario.persona_id;

  try {
    // Buscar el grupo del alumno en ese curso
    const grupoID = await models.Grupo.findOne({
      where: {
        curso_id,
      },
      include: [
        {
          model: models.Persona,
          attributes: ['ID', 'rol', 'dni', 'legajo', 'apellido', 'nombre'],
          where: { ID: personaId }, // Filtrar por la persona
        }
        ],
        attributes:["ID"]

    });
    console.log(grupoID)
    if (!grupoID) {
      return res.status(404).json({ message: 'Grupo no encontrado para este alumno en este curso' });
    }

    const grupo = await models.Grupo.findByPk(grupoID.ID,{
      include:[
        {
          model:models.Persona,
          attributes:['ID','rol','dni','legajo','apellido','nombre']
        }
      ],
      attributes:['ID','numero','nombre','curso_id']
    })

    res.status(200).json(grupo); // Devolver los detalles del grupo
  } catch (error) {
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener el grupo: ' + error.message
    });
  }
};

const actualizarGrupo = async (req, res, next) => {
    const { id } = req.params; // Obtiene el ID del grupo desde los parámetros
    const { nombreGrupo, legajos } = req.body; // Desestructura los datos del cuerpo de la solicitud

    try {
      // Validar que se envíen datos
      if (!nombreGrupo || !Array.isArray(legajos)) {
        return next({ ...errors.CredencialesInvalidas, details: '\'El nombre del grupo y los legajos son obligatorios.' })
      }
      // Busca el grupo existente por ID
      const grupoExistente = await models.Grupo.findByPk(id, { include: [{ model: models.Persona }] });
      if (!grupoExistente) {
        return next({ ...errors.NotFoundError, details: 'Grupo no encontrado' })
      }


      // Actualiza el nombre del grupo
      grupoExistente.nombre = nombreGrupo;


      // Encuentra los legajos actuales en el grupo
      const legajosActuales = grupoExistente.Personas.map(persona => persona.ID);


      // Encuentra los legajos que se han agregado
      const legajosNuevos = legajos.filter(id => !legajosActuales.includes(id));

      // Encuentra los legajos que se han eliminado
      const legajosEliminados = legajosActuales.filter(id => !legajos.includes(id));


      // Si hay actividades entregadas no pueden cambiar participantes
      const entrega = await models.Entrega.findOne({
        where:{grupo_id:id}
      })
      if (entrega && (legajosNuevos || legajosEliminados)){
          return next({...errors.ConflictError,details:'No puedes agregar o eliminar personas con entregas hechas'})
      }


      // Agregar los nuevos legajos
      for (const idPersona of legajosNuevos) {
        const persona = await models.Persona.findByPk(idPersona);
        if (persona) {
          await grupoExistente.addPersona(persona); // Agrega la persona al grupo
        }
      }

      // Eliminar los legajos que ya no están
      for (const idPersona of legajosEliminados) {
        const persona = await models.Persona.findByPk(idPersona);
        if (persona) {
          if (persona.ID === res.locals.usuario.persona_id){
            return next({...errors.ConflictError,details:'No te puedes eliminar de tu propio grupo'})
          }

          await grupoExistente.removePersona(persona); // Elimina la persona del grupo
        }
      }

      // Guarda los cambios en la base de datos
      await grupoExistente.save();

      // Responde con el grupo actualizado
      return res.status(200).json({ message: 'Grupo actualizado exitosamente.', grupo: grupoExistente });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al actualizar el grupo.' });
    }
  };



module.exports = {
  crear, addToGroup, ver, listar, verGrupoPorAlumno,actualizarGrupo
}
