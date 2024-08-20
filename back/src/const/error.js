module.exports = {
    'ValidationError':{
       code:1000,
       message:'Error de validación'
    },
    'FaltanCampos':{
        code:1001,
        message:'Faltan campos en la petición'
    },
    'CredencialesInvalidas':{
        code:1002,
        message:'Sus credenciales son invalidas'
    },
    'SesionExpirada':{
        code:1003,
        message:'Su sesión ha expirado'
    },
    'UsuarioNoAutorizado':{
        code:401,
        message:'El usuario no está autorizado'
    },
    'FaltanParametros':{
        code:1005,
        message:"Faltan parametros"
    },'UsuarioNoPersona':{
        code:1006,
        message:"El usuario no tiene persona asociada"
    }

}