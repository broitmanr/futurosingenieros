const models = require('../database/models/index')
const {yellow, blue} = require("picocolors");
const {Op} = require("sequelize");

async function crearNotificacion(tipo, texto, personaId) {
    try {
        // Verificar que el tipo de notificación existe
        const tipoNotificacion = await models.TipoNotificacion.findOne({
            where: { tipo }
        })
        if (!tipoNotificacion) {
            throw new Error(`Tipo de notificación '${tipo}' no encontrado.`)
        }

        // Verificar que el usuario existe
        const usuario = await Usuario.findOne({
            where:{persona_id:personaId}
        })
        if (!usuario) {
            throw new Error(`Usuario con ID de persona ${personaId} no encontrado.`)
        }

        // Crear la notificación
        const nuevaNotificacion = await models.Notificacion.create({
            detalle: texto,
            leido: false, // Inicialmente no leído
            updated_at: new Date(),
            tipoNotificacion_id: tipoNotificacion.ID,
            usuario_id: usuario.ID
        })

        return nuevaNotificacion
    } catch (error) {
        console.error('Error al crear la notificación:', error.message)
        throw error
    }
}

async function crearNotificacionesParaAlumnos(usuarioIds, mensaje, tipoNotificacionId, usuarioAccionId, transaction) {
    try {
        // Crear un array de notificaciones
        const notificaciones = usuarioIds.map(usuarioId => ({
            detalle: mensaje,
            leido: false,
            tipoNotificacion_id: tipoNotificacionId,
            usuario_id: usuarioId,
            updated_by: usuarioAccionId,
            fecha: new Date()
        }));

        // Crear todas las notificaciones en un solo query usando bulkCreate
        await models.Notificacion.bulkCreate(notificaciones, { transaction });

        console.log(`Notificaciones creadas para los usuarios: ${usuarioIds}`);
    } catch (error) {
        console.error('Error al crear notificaciones para los usuarios:', error);
        throw error;
    }
}


async function enviarNotificacionesVencimientoEntrega() {
    console.log(yellow('Creando notificaciones de vencimiento'));

    const fechaActual = new Date();


    const fechasVencimiento = [
        { label: '3 días', date: new Date(fechaActual) },
        { label: '1 día', date: new Date(fechaActual) }
    ];


    fechasVencimiento[0].date.setDate(fechaActual.getDate() + 3);
    fechasVencimiento[1].date.setDate(fechaActual.getDate() + 1);

    try {
        for (const { label, date } of fechasVencimiento) {
            console.log(label)
            const inicioDelDia = new Date(date);
            inicioDelDia.setUTCHours(0, 0, 0, 0); // 00:00:00 UTC del día de vencimiento

            const finDelDia = new Date(date);
            finDelDia.setUTCHours(23, 59, 59, 999); // 23:59:59 UTC del día de vencimiento

            const entregasProximasAVencer = await models.EntregaPactada.findAll({
                where: {
                    fechavto1: {
                        [Op.between]: [inicioDelDia, finDelDia]
                    }
                },
                include: [
                    {
                        model: models.InstanciaEvaluativa,
                        include: [
                            {
                                model: models.Curso,
                                include: [
                                    {
                                        model: models.Persona,
                                        required: true,
                                        where: { rol: 'A' },
                                        include: [{ model: models.Usuario }]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            for (const entrega of entregasProximasAVencer) {
                const cursoAlumnos = entrega.InstanciaEvaluativa.Curso.Personas;

                // Obtener las entregas relacionadas a la entrega pactada
                const entregas = await models.Entrega.findAll({
                    where: { entregaPactada_id: entrega.ID },
                    attributes: ['ID'] // Solo necesitamos los IDs de las entregas
                });

                // Obtener los IDs de las entregas
                const entregaIds = entregas.map(e => e.ID);

                // Obtener los alumnos que han hecho entregas
                const entregasRealizadas = await models.PersonaXEntrega.findAll({
                    where: {
                        entrega_id: { [Op.in]: entregaIds }
                    },
                    attributes: ['persona_id']
                });

                // Extraer solo los IDs de las personas que han realizado entregas
                const personaIdsConEntrega = new Set(entregasRealizadas.map(e => e.persona_id));

                // Filtrar los alumnos que no han realizado entregas
                const alumnosSinEntrega = cursoAlumnos.filter(alumno =>
                    !personaIdsConEntrega.has(alumno.ID) &&
                    alumno.Usuario // Solo aquellos que tienen un usuario asociado
                );

                // Si hay alumnos que no han realizado entregas, crear notificaciones
                if (alumnosSinEntrega.length > 0) {
                    const mensaje = `La entrega pactada "${entrega.nombre}" vence en ${label}. Recuerda completarla a tiempo.`;
                    const tipoNotificacionId = 3; // Cambia según el ID de tipo de notificación

                    const notificaciones = alumnosSinEntrega.map(alumno => {
                        return {
                            detalle: mensaje,
                            leido: false,
                            tipoNotificacion_id: tipoNotificacionId,
                            usuario_id: alumno.Usuario.ID,
                            updated_by: 'Sistema',
                            fecha: new Date()
                        };
                    });

                    await models.Notificacion.bulkCreate(notificaciones);
                }
            }
        }
        console.log('Notificaciones de vencimiento creadas correctamente.');
    } catch (error) {
        console.error('Error al enviar notificaciones de vencimiento:', error);
        throw error;
    }
}



module.exports = {
    crearNotificacion,crearNotificacionesParaAlumnos,enviarNotificacionesVencimientoEntrega
}
