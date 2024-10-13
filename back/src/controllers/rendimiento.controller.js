const errors = require('../const/error')
const models = require('../database/models/index')
const { red, yellow } = require('picocolors')
const { getEstado } = require('./entrega.controller')

// Función para tener el rendimiento de un alumno
async function alumno(req, res, next) {
  const { cursoId } = req.params;

  const alumnoID = res.locals.usuario.rol === 'D' ? req.params.alumnoId : res.locals.usuario.persona_id

  const notaParcial = await calcularNotaParcialAlumno(cursoId,alumnoID)
  console.log(notaParcial)

  if (!alumnoID){return next({...errors.FaltanParametros})}
  const rendimiento = await models.EntregaPactada.findAll({
    include: [
      {
        model: models.Entrega,
        required: false, // LEFT JOIN para incluir todas las EntregaPactada
        include: [
          {
            model: models.Persona,
            required: false, // LEFT JOIN con Persona
            where: {
              [models.Sequelize.Op.or]: [
                { ID: alumnoID },
                { ID: null }
              ]
            }
          },
          {
            model: models.PersonaXEntrega, // Incluir la tabla intermedia manualmente
            required: false, // LEFT JOIN con PersonaXEntrega
            attributes: ['porcentaje_participacion'], // Campos que quieres de la tabla intermedia
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

  // Proceso para mapear los resultados
  const entregaPactadaPromises = rendimiento.map(async (entregaPactada) => {
    const instancia = entregaPactada.InstanciaEvaluativa;
    const instanciaId = instancia.ID;

    const entrega = entregaPactada.Entregas[0];
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
        porcentaje_participacion: entrega?.PersonaXEntregas?.[0]?.porcentaje_participacion ?? null // Obtener el porcentaje de la tabla intermedia
      } : null,
      estado
    };
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

  // Devolver los datos agrupados
  res.status(200).json(Object.values(groupedData)); // Convertir a array si se desea
}


async function listarAlumnosDelCurso(req, res, next) {
  const { cursoId } = req.params;
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

    return res.status(200).json({ alumnos: resultado });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener el listado de alumnos.' });
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
          const notaEntrega = entrega.nota;

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

          // Calcular la nota final basada en el coeficiente ajustado
          let notaFinal = coeficiente * notaEntrega;
          notaFinal = Math.min(notaFinal, 10); // Limitar la nota máxima a 10

          notaPonderadaInstancia += notaFinal;
          notaEquiponderadaInstancia += notaFinal;
        }
      }
    }

    notaParcialCursoPonderada += (notaPonderadaInstancia * porcentajePonderacion) / 100;
    notaParcialCursoEquiponderada += (notaEquiponderadaInstancia * porcentajePonderacionEquiponderada) / 100;
  }

  return {
    notaParcialPonderada: notaParcialCursoPonderada.toFixed(2),
    notaParcialEquiponderada: notaParcialCursoEquiponderada.toFixed(2)
  };
}

// Función auxiliar para calcular las penalidades
async function calcularPenalidades(personaXcursoID) {

  const penalidades = await models.Penalidad.count({
    where: { personaxcurso_id: personaXcursoID }
  });

  return penalidades;
}


module.exports = {
  alumno,listarAlumnosDelCurso
}
