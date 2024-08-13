import errors from '../const/error.js'

const checkRoleDocente = async function (req,res,next){
    if (res.locals.usuario && res.locals.usuario.rol === 'D'){
        next()
    }
    else{
        return next(errors.UsuarioNoAutorizado)
    }

}

export default {checkRoleDocente};