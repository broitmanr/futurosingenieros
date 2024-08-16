const materia = require('../database/models/materia')
const errors = require('../const/error')


async function listarByAnio(req, res,next) {

    if (req.params == null)
        return next(errors.CredencialesInvalidas)

    try {
        // Crear un nuevo curso
        const materias = await materia.findAll({
            where: {
                anio: req.params.anio
            },
            attributes: ['ID', 'nombre','anio'],
        });
        // Responder con el curso creado
        res.status(200).json(materias);
    } catch (error) {
        return next()

    }
}

module.exports = {
    listarByAnio
};
