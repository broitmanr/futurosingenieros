const Joi = require('joi')

const crearGrupo = Joi.object({
  cursoID: Joi.number().integer().required().messages({
    'number.integer': 'El ID del curso debe ser un número entero.',
    'any.required': 'El ID del curso es obligatorio.'
  }),
  nombre: Joi.string().required().messages({
    'any.required': 'El nombre del grupo es obligatorio.'
  })
})

const addPersonaGrupo  = Joi.object({
  grupoID: Joi.number().integer().required().messages({
    'number.integer': 'El ID del grupo debe ser un número entero.',
    'any.required': 'El ID del grupo es obligatorio.'
  }),
  legajo: Joi.number().integer().required().messages({
    'number.integer': 'El legajo debe ser un número entero',
    'any.required': 'El nombre del grupo es obligatorio.'
  })
})
//
// const vincularEstudiante = Joi.object({
//   codigoVinculacion: Joi.string().required().messages({
//     'string.base': 'El código de vinculación debe ser una cadena de texto.',
//     'any.required': 'El código de vinculación es obligatorio.'
//   })
// })
//
// const generarCodigoVinculacion = Joi.object({
//   cursoId: Joi.number().integer().required().messages({
//     'number.integer': 'El ID del curso debe ser un número entero.',
//     'any.required': 'El ID del curso es obligatorio.'
//   })
// })
//
// const agregarEstudiantes = Joi.object({
//   estudiantes: Joi.array().items(Joi.number().integer().messages({
//     'number.integer': 'El ID del estudiante debe ser un número entero.'
//   })).required().messages({
//     'array.base': 'La lista de estudiantes debe ser un arreglo.',
//     'any.required': 'La lista de estudiantes es obligatoria.'
//   })
// })
//
// const eliminarEstudiantes = Joi.object({
//   estudiantes: Joi.array().items(Joi.number().integer().messages({
//     'number.integer': 'El ID del estudiante debe ser un número entero.'
//   })).required().messages({
//     'array.base': 'La lista de estudiantes debe ser un arreglo.',
//     'any.required': 'La lista de estudiantes es obligatoria.'
//   })
// })
//
// const eliminarCurso = Joi.object({
//   cursosIDs: Joi.array().items(Joi.number().integer().messages({
//     'number.integer': 'El ID del curso debe ser un número entero.'
//   })).required().messages({
//     'array.base': 'La lista de IDs de cursos debe ser un arreglo.',
//     'any.required': 'La lista de IDs de cursos es obligatoria.'
//   })
// })
//
// const verMiembrosCurso = Joi.object({
//   id: Joi.number().integer().required().messages({
//     'number.integer': 'El ID del curso debe ser un número entero.',
//     'any.required': 'El ID del curso es obligatorio.'
//   }),
//   rol: Joi.string().valid('A', 'D').optional().messages({
//     'string.base': 'El rol debe ser una cadena de texto.',
//     'any.only': 'El rol debe ser "A" (Estudiante) o "D" (Docente).'
//   })
// })

module.exports = {
 crearGrupo,addPersonaGrupo
}
