import Joi from 'joi'

let login = Joi.object({
    mail: Joi.string().email().required(),
    password: Joi.string().required()
})


const validations = {
    login
}
export default validations;