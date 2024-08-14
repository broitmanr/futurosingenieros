const comision = require('../database/models/comision')


// Función para crear un curso
async function listar(req, res,next) {

    try {
        // Crear un nuevo curso
        const comisiones = await comision.findAll({
            attributes: ['ID', 'nombre','anio'],
        });
        // Responder con el curso creado
        res.status(200).json(comisiones);
    } catch (error) {
        return next()

    }
}

module.exports = {
    listar
};
