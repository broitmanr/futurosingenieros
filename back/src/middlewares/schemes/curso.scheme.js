const Joi= require('joi')


const crearCurso = Joi.object({
    cicloLectivo:Joi.number().required(),
    materia_id:Joi.number().required(),
    comision_id:Joi.number().required(),

})


const validations = {
    crearCurso
}
module.exports = validations;