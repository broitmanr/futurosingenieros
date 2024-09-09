const Joi = require('joi')

const entregaPactadaBase = Joi.object({
  nombre: Joi.string().max(45).allow(null).messages({
    'string.base': 'El nombre debe ser una cadena de texto.',
    'string.max': 'El nombre no puede tener más de 45 caracteres.',
    'any.allowOnly': 'El nombre puede ser nulo.'
  }),
  numero: Joi.number().integer().required().messages({
    'number.base': 'El número debe ser un entero.',
    'any.required': 'El número es un campo obligatorio.'
  }),
  descripcion: Joi.string().max(200).allow(null).messages({
    'string.base': 'La descripción debe ser una cadena de texto.',
    'string.max': 'La descripción no puede tener más de 200 caracteres.',
    'any.allowOnly': 'La descripción puede ser nula.'
  }),
  fechavto1: Joi.date().required().messages({
    'date.base': 'La fecha de vencimiento 1 debe ser una fecha válida.',
    'any.required': 'La fecha de vencimiento 1 es un campo obligatorio.'
  }),
  fechavto2: Joi.date().allow(null).messages({
    'date.base': 'La fecha de vencimiento 2 debe ser una fecha válida.',
    'any.allowOnly': 'La fecha de vencimiento 2 puede ser nula.'
  }),
  instanciaEvaluativaID: Joi.number().integer().required().messages({
    'number.base': 'El ID de la instancia evaluativa debe ser un entero.',
    'any.required': 'El ID de la instancia evaluativa es un campo obligatorio.'
  }),
  updateByPersonID: Joi.number().integer().allow(null).messages({
    'number.base': 'El campo updated_by debe ser un número entero.',
    'any.allowOnly': 'El campo updated_by puede ser nulo.'
  })
}).unknown(false).messages({
  'object.unknown': '{{#label}} no es un parámetro permitido.'
})

const idParams = Joi.object({
  id: Joi.number().integer().required().messages({
    'number.base': 'El ID debe ser un entero.',
    'any.required': 'El ID es un campo obligatorio.'
  })
}).unknown(false).messages({
  'object.unknown': '{{#label}} no es un parámetro permitido.'
})

module.exports = {
  entregaPactadaBase,
  idParams
}
