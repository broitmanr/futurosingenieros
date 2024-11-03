const errors = require('../const/error')
const models = require('../database/models/index')
const { red, yellow } = require('picocolors')
const { getEstado } = require('./entrega.controller')

// Función para tener el rendimiento de un alumno
async function alumno(req, res, next) {
  const { cursoId } = req.params;
  const alumnoID = res.locals.usuario.rol === 'D' ? req.params.alumnoId : res.locals.usuario.persona_id;

  if (!alumnoID) {
    return next({ ...errors.FaltanParametros });
  }


  // Consulta las entregas que el alumno ha realizado
  const entregasRealizadas = await models.EntregaPactada.findAll({
    include: [
      {
        model: models.Entrega,
        required: true, // Asegúrate de que haya una entrega
        include: [
          {
            model: models.PersonaXEntrega,
            required: true,
            attributes: ['porcentaje_participacion'],
            where: {
              persona_id: alumnoID // Filtrar por el `persona_id`
            }
          }
        ]
      },
      {
        model: models.InstanciaEvaluativa,
        where: { curso_id: cursoId }
      }
    ]
  });

  // Consulta todas las entregas pactadas para el curso
  const entregasPactadas = await models.EntregaPactada.findAll({
    include: [
      {
        model: models.InstanciaEvaluativa,
        where: { curso_id: cursoId }
      }
    ]
  });


  const entregaPactadaPromises = entregasPactadas.map(async (entregaPactada) => {
    const instancia = entregaPactada.InstanciaEvaluativa;
    const instanciaId = instancia.ID;

    // Busca la entrega realizada por el alumno que corresponde a la entrega pactada
    const entregaRealizada = entregasRealizadas.find(ep => ep.ID === entregaPactada.ID);

    const entrega = entregaRealizada ? entregaRealizada.Entregas[0] : null;
    const estado = await getEstado(entrega ?? null);

    return {
      id: instanciaId,
      nombre: instancia.nombre,
      entregaPactada: {
        id: entregaPactada.ID,
        nombre: entregaPactada.nombre,
        fechavto1: entregaPactada.fechavto1,
        fechavto2: entregaPactada.fechavto2,
      },
      entrega: entrega ? {
        id: entrega.ID,
        fecha: entrega.fecha ?? null,
        nota: entrega.nota ?? null,
        porcentaje_participacion: entrega.PersonaXEntregas[0]?.porcentaje_participacion ?? null // Obtener el porcentaje de la tabla intermedia
      } : null,
      estado
    };
  });

  const penalidadesCount = await models.Penalidad.count({
    include:[
      {
        model:models.PersonaXCurso,
        where:{persona_id:alumnoID,curso_id:cursoId}
      }
    ]
  });


  const inasistenciasCount = await models.Inasistencia.count({
    where: { persona_id: alumnoID, curso_id: cursoId }
  });


  const alumno = await models.Persona.findOne({
    where: { ID: alumnoID },
    attributes: ['nombre', 'legajo','apellido'],
    include: [
      {
        model: models.Grupo,
        where:{curso_id:cursoId},
        required:false,
        attributes: ['nombre', 'numero'],
        through: {
          attributes: [] // Si tienes una tabla intermedia, puedes omitirla aquí
        }
      }
    ]
  });



  // Esperar a que todas las promesas se resuelvan
  const entregasAgrupadas = await Promise.all(entregaPactadaPromises);

  // Agrupamos los datos por ID de la instancia evaluativa
  const groupedData = entregasAgrupadas.reduce((acc, entrega) => {
    const instanciaId = entrega.id;

    // Aseguramos que el objeto para el ID de la instancia exista
    if (!acc[instanciaId]) {
      acc[instanciaId] = {
        id: instanciaId,
        nombre: entrega.nombre,
        entregas: []
      };
    }

    // Añadir la entrega a la instancia correspondiente
    acc[instanciaId].entregas.push({
      entregaPactada: entrega.entregaPactada,
      entrega: entrega.entrega,
      estado: entrega.estado
    });

    return acc;
  }, {});


  const curso = await models.Curso.findByPk(cursoId,{
    include: [
      {
        model: models.Materia,
        attributes: ['ID', 'nombre'] // Ajusta los atributos según tus necesidades
      },
      {
        model: models.Comision,
        attributes: ['ID', 'nombre'] // Ajusta los atributos según tus necesidades
      },

    ]
  })

  console.log(alumno)
  const response = {
    alumno: {
      nombre: alumno?.nombre ?? null,
      apellido: alumno?.apellido?? null,
      legajo: alumno?.legajo?? null,
      grupo: {
        nombre: alumno.Grupos[0]?.nombre || 'Sin grupo',
        numero: alumno.Grupos[0]?.numero || 'N/A'
      }
    },
    curso:{
      materia:curso.Materium?.nombre ?? 'Sin información',
      comision:curso.Comision?.nombre ?? 'Sin información'
    },
    penalidades: penalidadesCount,
    inasistencias: inasistenciasCount,
    entregasAgrupadas: Object.values(groupedData)
  };



  // Devolver los datos agrupados
  res.status(200).json(response);
}




async function listarAlumnosDelCurso(req, res, next) {
  const { cursoId } = req.params;
  if (!cursoId){return next({...errors.FaltanParametros})}

  const curso = await models.Curso.findByPk(cursoId,{
    attributes: ['ID'],
    include: [
      { model: models.Materia, attributes: ['ID', 'nombre'] },
      { model: models.Comision, attributes: ['ID', 'nombre'] },
    ],
  })
  if (!curso){return next({...errors.NotFoundError})}
  try {
    // Obtener todos los alumnos del curso
    const alumnos = await models.PersonaXCurso.findAll({
      where: { curso_id: cursoId , rol:'A'},
      include: [
        {
          model: models.Persona, // Información de la persona
          attributes: ['ID','legajo','nombre', 'apellido']
        }
      ]
    });

    const resultado = [];

    // Recorrer cada alumno y calcular sus notas y penalidades
    for (const alumno of alumnos) {
      const persona = alumno.Persona;
      const { ID, nombre, apellido,legajo } = persona;

      // Calcular las notas parciales
      const { notaParcialPonderada, notaParcialEquiponderada } = await calcularNotaParcialAlumno(cursoId, ID);

      // Calcular las penalidades
      const penalidades = await calcularPenalidades(alumno.ID);

      resultado.push({
        ID,
        nombre,
        apellido,
        legajo,
        notaParcialPonderada: parseFloat(notaParcialPonderada),
        notaParcialEquiponderada: parseFloat(notaParcialEquiponderada),
        penalidades
      });
    }

    return res.status(200).json({curso: {
        id: curso.ID,
        materia: curso.Materium?.nombre ?? '',
        comision: curso.Comision?.nombre ?? '',
      }, alumnos: resultado });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener el listado de alumnos.' });
  }
}

async function listarGruposDelCurso(req, res, next) {
  const { cursoId } = req.params
  if (!cursoId){return next({...errors.FaltanParametros})}

  const curso = await models.Curso.findByPk(cursoId,{
    attributes: ['ID'],
    include: [
      { model: models.Materia, attributes: ['ID', 'nombre'] },
      { model: models.Comision, attributes: ['ID', 'nombre'] },
    ],
  })
  if (!curso){return next({...errors.NotFoundError})}
  try {
    // Obtener todos los grupos del curso junto con sus integrantes
    const grupos = await models.Grupo.findAll({
      where: { curso_id: cursoId },
      attributes: ['ID', 'nombre','numero'],
      include: [
        {
          model: models.Persona, // Información de los integrantes
          attributes: ['ID', 'nombre', 'apellido', 'legajo'],
          through: { attributes: [] }, // Omitir los atributos de la tabla intermedia
        }
      ]
    });

    const resultado = [];

    // Recorrer cada grupo para calcular los datos solicitados
    for (const grupo of grupos) {
      const { ID: grupoID, nombre: grupoNombre, numero:grupoNumero} = grupo;

      // Calcular las entregas realizadas por el grupo
      const entregasRealizadas = await models.Entrega.count({
        where: { grupo_id: grupoID },
        include: [
          {
            model: models.EntregaPactada,
            include: [
              {
                model: models.InstanciaEvaluativa,
                where: { curso_id: cursoId, grupo: true }, // Solo instancias grupales
              },
            ],
          },
        ],
      });

      // Calcular el total de entregas pactadas grupales para el curso
      const entregasPactadas = await models.EntregaPactada.count({
        include: [
          {
            model: models.InstanciaEvaluativa,
            where: { curso_id: cursoId, grupo: true }, // Solo instancias grupales
          },
        ],
      });

      // Calcular las notas ponderadas y equiponderadas del grupo
      const { notaPonderada, promedioEquiponderado } = await calcularNotaGrupo(cursoId, grupoID);

      const integrantes = grupo.Personas.map(persona => {
        const { ID, nombre, apellido, legajo } = persona;
        const nombreAbreviado = `${apellido}, ${nombre.charAt(0)}`;
        return {
          ID,
          legajo,
          nombreAbreviado,
        };
      });

      // Añadir el grupo al resultado
      resultado.push({
        grupoID,
        grupoNumero,
        grupoNombre,
        integrantes,
        cantidadEntregas: `${entregasRealizadas}/${entregasPactadas}`,
        promedioPonderado: parseFloat(notaPonderada),
        promedioEquiponderado: parseFloat(promedioEquiponderado),
      });
    }

    return res.status(200).json({  curso: {
        id: curso.ID,
        materia: curso.Materium?.nombre ?? '',
        comision: curso.Comision?.nombre ?? '',
      }, grupos: resultado });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener el listado de grupos.' });
  }
}



async function calcularNotaParcialAlumno(cursoId, personaId) {
  const instanciasEvaluativas = await models.InstanciaEvaluativa.findAll({
    where: { curso_id: cursoId },
    include: [
      {
        model: models.EntregaPactada,
        include: [
          {
            model: models.Entrega,
            include: [
              {
                model: models.PersonaXEntrega,
                where: { persona_id: personaId },
                attributes: ['porcentaje_participacion']
              }
            ],
            where: { nota: { [models.Sequelize.Op.ne]: null } },
            required: false
          }
        ]
      }
    ]
  });

  let notaParcialCursoPonderada = 0;
  let notaParcialCursoEquiponderada = 0;
  let totalEntregas = 0; // Contador de entregas
  let sumaTotalEntregas = 0;
  const porcentajePonderacionEquiponderada = (100 / instanciasEvaluativas.length).toFixed(2);

  for (const instancia of instanciasEvaluativas) {
    const porcentajePonderacion = instancia.porcentaje_ponderacion;
    let notaPonderadaInstancia = 0;
    let notaEquiponderadaInstancia = 0;

    for (const entregaPactada of instancia.EntregaPactadas) {
      for (const entrega of entregaPactada.Entregas) {
        const personaXEntrega = entrega.PersonaXEntregas[0];

        if (personaXEntrega) {
          const porcentajeParticipacion = personaXEntrega.porcentaje_participacion;
          const notaEntrega = entrega.nota
          sumaTotalEntregas += entrega.nota
          let totalIntegrantes = 1;

          if (entrega.grupo_ID) {
            totalIntegrantes = await models.PersonaXGrupo.count({
              where: { grupo_id: entrega.grupo_ID }
            });
          }

          const participacionEsperada = 100 / totalIntegrantes;
          let coeficiente;

          if (porcentajeParticipacion <= participacionEsperada) {
            // Penalización suave por menor participación
            const diferencia = participacionEsperada - porcentajeParticipacion;
            coeficiente = 1 - (diferencia / participacionEsperada) * 0.5;
          } else {
            // Ajuste para exceso de participación
            const exceso = porcentajeParticipacion - participacionEsperada;
            const coeficienteExtra = (exceso / 100) * 0.3; // Ajuste moderado
            coeficiente = 1 + coeficienteExtra;
          }
          coeficiente=coeficiente.toFixed(2)
          // Calcular la nota final basada en el coeficiente ajustado
          let notaFinal = coeficiente * notaEntrega;
          notaFinal = Math.min(notaFinal, 10); // Limitar la nota máxima a 10
          notaPonderadaInstancia += notaFinal;
          notaEquiponderadaInstancia += notaFinal;

          totalEntregas++; // Contar la entrega
        }
      }
    }


    if (totalEntregas > 0) {
      notaParcialCursoPonderada += (notaPonderadaInstancia/ totalEntregas) * (porcentajePonderacion/100) ;
      notaParcialCursoEquiponderada += (notaEquiponderadaInstancia / totalEntregas) * (porcentajePonderacionEquiponderada/100) ;
    }
  }

  return {
    notaParcialPonderada: parseFloat(notaParcialCursoPonderada.toFixed(2)),
    // notaParcialEquiponderada: parseFloat(notaParcialCursoEquiponderada.toFixed(2))
    notaParcialEquiponderada: parseFloat((sumaTotalEntregas/totalEntregas).toFixed(2))
  };
}

async function grupo(req, res, next) {
  const { cursoId } = req.params;
  let grupo;

  if (res.locals.usuario.rol === 'D') {
    const { grupoId } = req.params;
    if (!grupoId) return next({ ...errors.FaltanParametros });

    // Obtener datos del grupo, curso, y alumnos
    grupo = await models.Grupo.findOne({
      where: { ID: grupoId },
      attributes: ['ID', 'nombre', 'numero'],
      include: [
        {
          model: models.Curso,
          where: { ID: cursoId },
          attributes: ['ID'],
          include: [
            { model: models.Materia, attributes: ['ID', 'nombre'] },
            { model: models.Comision, attributes: ['ID', 'nombre'] },
          ],
        },
        {
          model: models.Persona,
          attributes: ['ID', 'nombre','apellido', 'legajo'],
          through: { attributes: [] },
        },
      ],
    });
  } else {
    const grupoID = await models.Grupo.findOne({
      attributes: ['ID'],
      include: [
        {
          model: models.Curso,
          where: { ID: cursoId },
          attributes: [],
        },
        {
          model: models.Persona,
          attributes: [],
          where: { id: res.locals.usuario.persona_id },
          through: { attributes: [] },
        },
      ],
    });

    grupo = await models.Grupo.findByPk(grupoID.ID, {
      attributes: ['ID', 'nombre', 'numero'],
      include: [
        {
          model: models.Curso,
          include: [
            { model: models.Materia, attributes: ['ID', 'nombre'] },
            { model: models.Comision, attributes: ['ID', 'nombre'] },
          ],
          attributes: ['ID'],
        },
        {
          model: models.Persona,
          attributes: ['ID', 'nombre','apellido', 'legajo'],
          through: { attributes: [] },
        },
      ],
    });
  }

  if (!grupo) return next({ ...errors.NotFoundError, details: 'Grupo no encontrado' });

  const alumnosIds = grupo.Personas.map(persona => persona.ID);

  // Consulta las entregas realizadas por los alumnos del grupo en instancias evaluativas grupales
  const entregasRealizadas = await models.EntregaPactada.findAll({
    include: [
      {
        model: models.Entrega,
        required: true,
        include: [
          {
            model: models.PersonaXEntrega,
            required: true,
            attributes: ['persona_id', 'porcentaje_participacion'],
            where: { persona_id: alumnosIds },
          },
        ],
      },
      {
        model: models.InstanciaEvaluativa,
        where: { curso_id: cursoId, grupo: true }, // Filtrar solo instancias grupales
      },
    ],
  });

  // Consulta todas las entregas pactadas grupales para el curso
  const entregasPactadas = await models.EntregaPactada.findAll({
    include: [
      {
        model: models.InstanciaEvaluativa,
        where: { curso_id: cursoId, grupo: true }, // Solo instancias grupales
      },
    ],
  });

  const entregaPactadaPromises = entregasPactadas.map(async (entregaPactada) => {
    const instancia = entregaPactada.InstanciaEvaluativa;
    const instanciaId = instancia.ID;

    // Filtrar las entregas realizadas por los miembros del grupo
    const entregasGrupo = entregasRealizadas.filter(ep => ep.ID === entregaPactada.ID);

    const entregasDetalle = entregasGrupo.map(ep => {
      const entrega = ep.Entregas[0];
      return {
        entregaId: entrega.ID,
        fecha: entrega.fecha ?? null,
        nota: entrega.nota ?? null,
      };
    });


    const estado = await getEstado(entregasDetalle.length > 0 ? entregasDetalle[0] : null);

    return {
      id: instanciaId,
      nombre: instancia.nombre,
      entregaPactada: {
        id: entregaPactada.ID,
        nombre: entregaPactada.nombre,
        fechavto1: entregaPactada.fechavto1,
        fechavto2: entregaPactada.fechavto2,
      },
      entregas: entregasDetalle,
      estado,
    };
  });

  const entregasAgrupadas = await Promise.all(entregaPactadaPromises);

  // Calcular la participación promedio por alumno
  const participacionPorAlumno = alumnosIds.map(alumnoId => {
    const participaciones = entregasRealizadas.flatMap(ep =>
        ep.Entregas.flatMap(e => e.PersonaXEntregas)
    ).filter(px => px.persona_id === alumnoId);

    const totalParticipacion = participaciones.reduce((acc, px) => acc + px.porcentaje_participacion, 0);
    const promedioParticipacion = participaciones.length > 0 ? totalParticipacion / participaciones.length : 0;

    return { alumnoId, promedioParticipacion };
  });

  // Agrupar la información del grupo con los resultados
  const response = {
    curso: {
      id: grupo.Curso.id,
      materia: grupo.Curso.Materium?.nombre ?? '',
      comision: grupo.Curso.Comision?.nombre ?? '',
    },
    grupo: {
      nombre: grupo.nombre,
      numero: grupo.numero,
    },
    alumnos: grupo.Personas.map(persona => ({
      id: persona.ID,
      nombre: persona.nombre,
      apellido: persona.apellido,
      legajo: persona.legajo,
      promedioParticipacion: participacionPorAlumno.find(p => p.alumnoId === persona.ID)?.promedioParticipacion.toFixed(2) ?? 0,
    })),
    entregasAgrupadas,
  };

  res.status(200).json(response);
}

async function calcularNotaGrupo(cursoId, grupoId) {
  try {
    // Obtener todas las entregas del grupo
    const entregas = await models.Entrega.findAll({
      where: { grupo_id: grupoId },
      include: [
        {
          model: models.EntregaPactada,
          include: [
            {
              model: models.InstanciaEvaluativa,
              attributes: ['porcentaje_ponderacion']  // Obtener el porcentaje de ponderación de la instancia
            }
          ]
        }
      ]
    });

    let totalNotaPonderada = 0;
    let sumaNotasEquiponderadas = 0;
    let totalEntregasConNota = 0;

    // Agrupar las entregas por instancia evaluativa
    const instanciasEvaluativasMap = {};

    entregas.forEach(entrega => {
      const entregaPactada = entrega.EntregaPactada;
      const instanciaEvaluativa = entregaPactada.InstanciaEvaluativa;
      const porcentajePonderacion = instanciaEvaluativa.porcentaje_ponderacion;

      if (!instanciasEvaluativasMap[instanciaEvaluativa.ID]) {
        instanciasEvaluativasMap[instanciaEvaluativa.ID] = {
          porcentajePonderacion,
          notas: []
        };
      }

      // Si la entrega tiene una nota, agregarla al array de notas de esa instancia evaluativa
      if (entrega.nota !== null) {
        instanciasEvaluativasMap[instanciaEvaluativa.ID].notas.push(entrega.nota);

        // Para el cálculo del promedio equiponderado, sumamos la nota
        sumaNotasEquiponderadas += entrega.nota;
        totalEntregasConNota += 1;  // Contamos esta entrega que tiene nota
      }
    });

    // Calcular la nota ponderada para cada instancia evaluativa
    for (const instanciaId in instanciasEvaluativasMap) {
      const { porcentajePonderacion, notas } = instanciasEvaluativasMap[instanciaId];

      if (notas.length > 0) {

        // Calcular el promedio de las notas de las entregas de esta instancia evaluativa
        const sumaNotas = notas.reduce((acc, nota) => acc + nota, 0);
        const promedioNotas = sumaNotas / notas.length;

        // Aportación de esta instancia a la nota final ponderada
        const aporteNotaPonderada = promedioNotas * (porcentajePonderacion / 100);

        // Sumar al total de la nota ponderada
        totalNotaPonderada += aporteNotaPonderada;
      }
    }

    // Calcular el promedio equiponderado
    let promedioEquiponderado = 0;
    if (totalEntregasConNota > 0) {

      promedioEquiponderado = sumaNotasEquiponderadas / totalEntregasConNota;
    }

    // Devolver la nota ponderada y el promedio equiponderado

    return {
      notaPonderada: totalNotaPonderada.toFixed(2),
      promedioEquiponderado: promedioEquiponderado.toFixed(2)
    };
  } catch (error) {
    console.error('Error al calcular la nota del grupo:', error);
    throw error;
  }
}




// Función auxiliar para calcular las penalidades
async function calcularPenalidades(personaXcursoID) {

  const penalidades = await models.Penalidad.count({
    where: { personaxcurso_id: personaXcursoID }
  });

  return penalidades;
}






module.exports = {
  alumno,listarAlumnosDelCurso,grupo,listarGruposDelCurso
}
