const Joi= require('joi')


const crearCurso = Joi.object({
    cicloLectivo:Joi.number().required(),
    materia_id:Joi.number().required(),
    comision_id:Joi.number().required(),

})

const vincularEstudiante = Joi.object({
    codigoVinculacion: Joi.string().required()
})

const generarCodigoVinculacion = Joi.object({
    cursoId: Joi.number().required(),
})

const validations = {
    crearCurso,
    vincularEstudiante,
    generarCodigoVinculacion
}
module.exports = validations;