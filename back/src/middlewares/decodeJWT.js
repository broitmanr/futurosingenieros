const jwt = require('jsonwebtoken')
const errors = require('../const/error')
const models = require('../database/models/index')
const { JWT_SECRET } = require("../const/globalConstant")
const moment = require('moment')


const decodeJWT = async function (req,res,next){

    if (req.header('Authorization') && req.header('Authorization').split(' ').length > 1){

        try{
            let dataToken = jwt.verify(req.header('Authorization').split(' ')[1],JWT_SECRET)
            if (dataToken.exp <= moment().unix())
                return next(errors.SesionExpirada)
            res.locals.token = dataToken
            console.log(dataToken)
            const usuario = await Usuario.findOne({
                where:{
                    ID:dataToken.id
                }
            })

            if (!usuario) return next(errors.UsuarioNoAutorizado)

            res.locals.usuario = usuario
            next()
        }catch (err){
            console.log(err)
            return next(errors.UsuarioNoAutorizado)
        }
    }else if (req.cookies.jwt){
        try{
            let dataToken = jwt.verify(req.cookies.jwt,JWT_SECRET)
            if (dataToken.exp <= moment().unix())
                return next(errors.SesionExpirada)
            res.locals.token = dataToken
            console.log(dataToken)
            const usuario = await models.Usuario.findOne({
                where:{
                    ID:dataToken.id
                }
            })

            if (!usuario) return next(errors.UsuarioNoAutorizado)

            res.locals.usuario = usuario
            next()
        }catch (err){
            console.log(err)
            return next(errors.UsuarioNoAutorizado)
        }
    }
    else{
        return next(errors.UsuarioNoAutorizado)
    }

}

module.exports = decodeJWT;