import Joi from 'joi'

const crearUsuario = Joi.object({
    email: Joi.string().required()
})


const validations = {
    crearUsuario
}
export default validations;