const cron = require('node-cron');
const { enviarNotificacionesVencimientoEntrega } = require('./notificacionService');
const { enviarCorreosVencimientoEntrega } = require('../mailer/mailService');
const {yellow} = require("picocolors");

function iniciarNotificacionesVencimiento() {
    // Configuración para ejecutar la tarea todos los días a las 8:00 AM
    cron.schedule('0 6 * * *', async () => {
        console.log(yellow('Ejecutando tarea programada para verificar entregas pactadas'));
        await enviarNotificacionesVencimientoEntrega();
    });

    // cron.schedule('0 9 * * *', async () => {
    //     console.log(yellow('Ejecutando tarea programada para enviar mail'));
    //     await enviarCorreosVencimientoEntrega();
    // });
}

module.exports = {
    iniciarNotificacionesVencimiento
};
