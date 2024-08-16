const Joi= require('joi')

let login = Joi.object({
    mail: Joi.string().email().required(),
    password: Joi.string().required()
})


const validations = {
    login
}
module.exports = validations