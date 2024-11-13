const cron = require('node-cron');
const { enviarNotificacionesVencimientoEntrega } = require('./notificacionService');
const { enviarCorreosVencimientoEntrega, enviarCorreosVencimientoEntregaHoy} = require('../mailer/mailService');
const {yellow} = require("picocolors");

function iniciarNotificacionesVencimiento() {
    // Configuración para ejecutar la tarea todos los días a las 8:00 AM
    // cron.schedule('0 6 * * *', async () => {
    //     console.log(yellow('Ejecutando tarea programada para verificar entregas pactadas'));
    //     await enviarNotificacionesVencimientoEntrega();
    // });

    cron.schedule('0 10 * * *', async () => {
        console.log(yellow('Ejecutando tarea programada para enviar mail'));
        await enviarCorreosVencimientoEntrega();
    });

    cron.schedule('0 8 * * *', async () => {
        console.log(yellow('Ejecutando tarea programada para enviar mail'));
        await enviarCorreosVencimientoEntregaHoy();
    });
}

module.exports = {
    iniciarNotificacionesVencimiento
};
