const Joi= require('joi')

const crearUsuario = Joi.object({
    email: Joi.string().required()
})


const validations = {
    crearUsuario
}
module.exports =  validations;