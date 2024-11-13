const models = require('../database/models/index')
const {Op} = require("sequelize");
const {mailEntrega} = require("./sendEmailWithTemplate");

async function enviarCorreosVencimientoEntrega() {

    const fechaActual = new Date();
    const fechaVencimiento = new Date(fechaActual);
    fechaVencimiento.setDate(fechaActual.getDate() + 2);

    const inicioDelDia = new Date(fechaVencimiento);
    inicioDelDia.setUTCHours(0, 0, 0, 0);

    const finDelDia = new Date(fechaVencimiento);
    finDelDia.setUTCHours(23, 59, 59, 999);

    try {
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

            const entregas = await models.Entrega.findAll({
                where: { entregaPactada_id: entrega.ID },
                attributes: ['ID']
            });

            const entregaIds = entregas.map(e => e.ID);

            const entregasRealizadas = await models.PersonaXEntrega.findAll({
                where: {
                    entrega_id: { [Op.in]: entregaIds }
                },
                attributes: ['persona_id']
            });

            const personaIdsConEntrega = new Set(entregasRealizadas.map(e => e.persona_id));

            const alumnosSinEntrega = cursoAlumnos.filter(alumno =>
                !personaIdsConEntrega.has(alumno.ID) &&
                alumno.Usuario // Solo alumnos con usuario
            );

            if (alumnosSinEntrega.length > 0) {
                const mails = alumnosSinEntrega.map(alumno => alumno.Usuario.mail);
                const mensajePersonalizado = `La entrega pactada "${entrega.nombre}" vence en 2 días. ¡Asegúrate de completar tu entrega a tiempo!`;

                try {
                    await mailEntrega(mails, mensajePersonalizado);
                } catch (error) {
                    console.error(`Error al enviar correo para entrega "${entrega.nombre}":`, error);
                }
            }
        }
        console.log('Correos de vencimiento enviados correctamente.');
    } catch (error) {
        console.error('Error al enviar correos de vencimiento:', error);
        throw error;
    }
}



async function enviarCorreosVencimientoEntregaHoy() {

    const fechaActual = new Date();
    const fechaVencimiento = new Date(fechaActual);

    const inicioDelDia = new Date(fechaVencimiento);
    inicioDelDia.setUTCHours(0, 0, 0, 0);

    const finDelDia = new Date(fechaVencimiento);
    finDelDia.setUTCHours(23, 59, 59, 999);

    try {
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

            const entregas = await models.Entrega.findAll({
                where: { entregaPactada_id: entrega.ID },
                attributes: ['ID']
            });

            const entregaIds = entregas.map(e => e.ID);

            const entregasRealizadas = await models.PersonaXEntrega.findAll({
                where: {
                    entrega_id: { [Op.in]: entregaIds }
                },
                attributes: ['persona_id']
            });

            const personaIdsConEntrega = new Set(entregasRealizadas.map(e => e.persona_id));

            const alumnosSinEntrega = cursoAlumnos.filter(alumno =>
                !personaIdsConEntrega.has(alumno.ID) &&
                alumno.Usuario // Solo alumnos con usuario
            );

            if (alumnosSinEntrega.length > 0) {
                const mails = alumnosSinEntrega.map(alumno => alumno.Usuario.mail);
                const mensajePersonalizado = `La entrega pactada "${entrega.nombre}" vence hoy ¡Asegurate de completar tu entrega a tiempo!`;

                try {
                    await mailEntrega(mails, mensajePersonalizado);
                } catch (error) {
                    console.error(`Error al enviar correo para entrega "${entrega.nombre}":`, error);
                }
            }
        }
        console.log('Correos de vencimiento enviados correctamente.');
    } catch (error) {
        console.error('Error al enviar correos de vencimiento:', error);
        throw error;
    }
}

module.exports = {
    enviarCorreosVencimientoEntrega,
    enviarCorreosVencimientoEntregaHoy

}