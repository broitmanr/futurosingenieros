const Joi = require('joi')

const instanciaBase = Joi.object({
  cursoID: Joi.number().integer().required().messages({
    'number.integer': 'El ID debe ser un numero entero',
    'any.required': 'El curso es obligatorio.'
  }),
  nombre: Joi.string().required().messages({
    'any.required': 'El curso es obligatorio.'
  }),
  descripcion: Joi.string().optional(),
  porcentajePonderacion: Joi.number().greater(0).less(100).messages({
    'any.required': 'El curso es obligatorio.',
    'number.greater': 'El rango es de 0 a 100',
    'number.less': 'El rango es de 0 a 100'
  }),
  tipoInstanciaID: Joi.number().integer().required().messages({
    'number.integer': 'El ID del tipo instancia debe ser un número entero.',
    'any.required': 'El ID del tipo instancia es obligatorio.'
  }),
  grupo: Joi.boolean().required().messages({
    'any.required': 'El valor de grupo es obligatorio y debe ser un booleano.'
  }),
  penalidad_aplicable: Joi.boolean().required().messages({
    'any.required': 'El valor de penalidad_aplicable es obligatorio y debe ser un booleano.'
  })
})

module.exports = {
  instanciaBase
}
