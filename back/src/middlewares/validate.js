module.exports = (scheme) => {
  return (req, res, next) => {
    const { error } = scheme.validate({ ...req.params, ...req.query, ...req.body })
    if (error) {
      next(error)
    } else {
      next()
    }
  }
}
