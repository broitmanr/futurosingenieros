module.exports = {
  // Error de validación genérico
  ValidationError: {
    code: 400, // Código de estado HTTP 400 (Bad Request)
    message: 'Error de validación'
  },
  // Error cuando faltan campos requeridos en la petición
  FaltanCampos: {
    code: 400, // Código de estado HTTP 400 (Bad Request)
    message: 'Faltan campos en la petición'
  },
  // Error cuando las credenciales proporcionadas son inválidas
  CredencialesInvalidas: {
    code: 401, // Código de estado HTTP 401 (Unauthorized)
    message: 'Sus credenciales son inválidas'
  },
  // Error cuando la sesión del usuario ha expirado
  SesionExpirada: {
    code: 401, // Código de estado HTTP 401 (Unauthorized)
    message: 'Su sesión ha expirado'
  },
  // Error cuando el usuario no está autorizado para realizar una acción
  UsuarioNoAutorizado: {
    code: 403, // Código de estado HTTP 403 (Forbidden)
    message: 'El usuario no está autorizado'
  },
  // Error cuando faltan parámetros en la petición
  FaltanParametros: {
    code: 400, // Código de estado HTTP 400 (Bad Request)
    message: 'Faltan parámetros'
  },
  // Error cuando el usuario no tiene una persona asociada
  UsuarioNoPersona: {
    code: 400, // Código de estado HTTP 400 (Bad Request)
    message: 'El usuario no tiene persona asociada'
  }
}
