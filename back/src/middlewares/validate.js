const validate = (schemas) => {
  return (req, res, next) => {
    const validationErrors = []
    if (schemas.params) {
      const { error } = schemas.params.validate(req.params, { abortEarly: false })
      if (error) {
        validationErrors.push(...error.details.map(detail => detail.message))
      }
    }

    if (schemas.query) {
      const { error } = schemas.query.validate(req.query, { abortEarly: false })
      if (error) {
        validationErrors.push(...error.details.map(detail => detail.message))
      }
    }

    console.log(schemas)
    if (schemas.body) {
      const { error } = schemas.body.validate(req.body, { abortEarly: false })
      if (error) {
        validationErrors.push(...error.details.map(detail => detail.message))
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'Error de validación',
          details: validationErrors.join(', ')
        }
      })
    }

    next()
  }
}

module.exports = validate
