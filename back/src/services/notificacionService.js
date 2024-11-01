const models = require('../database/models/index')

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

module.exports = {
    crearNotificacion,crearNotificacionesParaAlumnos
}
