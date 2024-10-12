const errors = require('../const/error.js')

const checkRole = function (...allowedRoles) {
  return async function (req, res, next) {
    if (res.locals.usuario && allowedRoles.includes(res.locals.usuario.rol)) {
      next()
    } else {
      return next({ ...errors.UsuarioNoAutorizado, details: 'No tiene permisos para realizar esta acción con su rol' })
    }
  }
}

module.exports = {
  checkRoleDocente: checkRole('D'),
  checkRoleEstudiante: checkRole('A'),
  checkRole
}
