const models = require('../database/models/index')
const errors = require('../const/error.js')

async function validarDocenteInstanciaEvaluativa (req, res, next, continuarEnError = false) {
  const { instanciaEvaluativaID } = req.body
  const usuario = res.locals.usuario

  try {
    const instanciaEvaluativa = await models.InstanciaEvaluativa.findByPk(instanciaEvaluativaID, {
      attributes: ['ID', 'curso_id'],
      include: {
        model: models.Curso,
        attributes: ['ID'],
        include: {
          model: models.PersonaXCurso,
          attributes: ['ID'],
          where: { persona_id: usuario.persona_id, rol: 'D' },
          required: true
        }
      }
    })

    if (!instanciaEvaluativa || !instanciaEvaluativa.Curso || instanciaEvaluativa.Curso.PersonaXCursos.length === 0) {
      const error = {
        ...errors.UsuarioNoAutorizado,
        details: `No tiene permisos asociados a la instancia evaluativa con ID ${instanciaEvaluativaID}. Verifique que este utilizando la cuenta correcta o que este asociado como docente en el curso.`
      }

      if (continuarEnError) {
        return { error } // Retornar el error sin llamar a next
      } else {
        return next(error) // Llamar a next en caso de estar en el router
      }
    }

    // Si todo va bien, continuar
    next()
  } catch (error) {
    next(error)
  }
}

async function validarDocenteEntregaPactada (req, res, next) {
  const { id } = req.params
  const usuario = res.locals.usuario

  try {
    // Buscar la entrega pactada junto con la instancia evaluativa y el curso asociado
    const entregaPactada = await models.EntregaPactada.findByPk(id, {
      attributes: ['ID', 'instanciaEvaluativa_id'],
      include: {
        model: models.InstanciaEvaluativa,
        attributes: ['ID', 'curso_id'],
        include: {
          model: models.Curso,
          attributes: ['ID'],
          include: {
            model: models.PersonaXCurso,
            attributes: ['ID'],
            where: { persona_id: usuario.persona_id, rol: 'D' },
            required: true // Asegurarse de que la relación sea obligatoria
          }
        }
      }
    })

    // Si no se encuentra la entrega pactada o el usuario no es docente en el curso, devolver un error
    if (!entregaPactada || !entregaPactada.InstanciaEvaluativa || !entregaPactada.InstanciaEvaluativa.Curso || entregaPactada.InstanciaEvaluativa.Curso.PersonaXCursos.length === 0) {
      return next({
        ...errors.UsuarioNoAutorizado,
        details: `No tiene permisos asociados a la entrega pactada con ID ${id}. Verifique que este utilizando la cuenta correcta o que este asociado como docente en el curso.`
      })
    }
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = {
  validarDocenteInstanciaEvaluativa,
  validarDocenteEntregaPactada
}
