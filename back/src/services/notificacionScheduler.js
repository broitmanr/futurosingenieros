const cron = require('node-cron');
const { enviarNotificacionesVencimientoEntrega } = require('./notificacionService');
const {yellow} = require("picocolors");

function iniciarNotificacionesVencimiento() {
    // Configuración para ejecutar la tarea todos los días a las 8:00 AM
    cron.schedule('10 7 * * *', async () => {
        console.log(yellow('Ejecutando tarea programada para verificar entregas pactadas'));
        await enviarNotificacionesVencimientoEntrega();
    });
}

module.exports = {
    iniciarNotificacionesVencimiento
};
