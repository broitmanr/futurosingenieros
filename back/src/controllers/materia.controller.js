const models = require('../database/models/index.js')
const errors = require('../const/error')

async function listarByAnio(req, res,next) {

    // req.params.anio = 2
    console.log(req.params.anio )
    if (req.params == null)
        return next(errors.CredencialesInvalidas)
    try {
        // Crear un nuevo curso
        const materias = await models.Materia.findAll({
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
}
