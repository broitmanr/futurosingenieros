const Joi = require('joi')

const cursoBase = Joi.object({
  cicloLectivo: Joi.number().integer().required().messages({
    'number.integer': 'El ciclo lectivo debe ser un número entero.',
    'any.required': 'El ciclo lectivo es obligatorio.'
  }),
  materiaID: Joi.number().integer().required().messages({
    'number.integer': 'El ID de la metaria debe ser un número entero.',
    'any.required': 'El ID de la materia es obligatorio.'
  }),
  comisionID: Joi.number().integer().required().messages({
    'number.integer': 'El ID de la comision debe ser un número entero.',
    'any.required': 'El ID de la comisión es obligatorio.'
  })
})

const vincularEstudiante = Joi.object({
  codigoVinculacion: Joi.string().required().messages({
    'string.base': 'El código de vinculación debe ser una cadena de texto.',
    'any.required': 'El código de vinculación es obligatorio.'
  })
})

const generarCodigoVinculacion = Joi.object({
  cursoId: Joi.number().integer().required().messages({
    'number.integer': 'El ID del curso debe ser un número entero.',
    'any.required': 'El ID del curso es obligatorio.'
  })
})

const agregarEstudiantes = Joi.object({
  estudiantes: Joi.array().items(Joi.number().integer().messages({
    'number.integer': 'El ID del estudiante debe ser un número entero.'
  })).required().messages({
    'array.base': 'La lista de estudiantes debe ser un arreglo.',
    'any.required': 'La lista de estudiantes es obligatoria.'
  })
})

const eliminarEstudiantes = Joi.object({
  estudiantes: Joi.array().items(Joi.number().integer().messages({
    'number.integer': 'El ID del estudiante debe ser un número entero.'
  })).required().messages({
    'array.base': 'La lista de estudiantes debe ser un arreglo.',
    'any.required': 'La lista de estudiantes es obligatoria.'
  })
})

const eliminarCurso = Joi.object({
  cursosIDs: Joi.array().items(Joi.number().integer().messages({
    'number.integer': 'El ID del curso debe ser un número entero.'
  })).required().messages({
    'array.base': 'La lista de IDs de cursos debe ser un arreglo.',
    'any.required': 'La lista de IDs de cursos es obligatoria.'
  })
})

const verMiembrosCurso = Joi.object({
  id: Joi.number().integer().required().messages({
    'number.integer': 'El ID del curso debe ser un número entero.',
    'any.required': 'El ID del curso es obligatorio.'
  }),
  rol: Joi.string().valid('A', 'D').optional().messages({
    'string.base': 'El rol debe ser una cadena de texto.',
    'any.only': 'El rol debe ser "A" (Estudiante) o "D" (Docente).'
  })
})

const modificarPatch = Joi.object({
  cicloLectivo: Joi.number().integer().optional().messages({
    'number.integer': 'El ciclo lectivo debe ser un número entero.'
  }),
  materiaID: Joi.number().integer().optional().messages({
    'number.integer': 'El ID de la materia debe ser un número entero.'
  }),
  comisionID: Joi.number().integer().optional().messages({
    'number.integer': 'El ID de la comisión debe ser un número entero.'
  })
})

module.exports = {
  cursoBase,
  vincularEstudiante,
  generarCodigoVinculacion,
  agregarEstudiantes,
  eliminarEstudiantes,
  eliminarCurso,
  verMiembrosCurso,
  modificarPatch
}
