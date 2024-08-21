const errors = require ('../const/error.js')

const checkRoleDocente = async function (req,res,next){
    if (res.locals.usuario && res.locals.usuario.rol === 'D'){
        next()
    }
    else{
        return next(errors.UsuarioNoAutorizado)
    }

}
const checkRoleEstudiante = async function (req,res,next){
    if (res.locals.usuario && res.locals.usuario.rol === 'E'){
        next()
    }
    else{
        return next(errors.UsuarioNoAutorizado)
    }

}

module.exports = {checkRoleDocente, checkRoleEstudiante};