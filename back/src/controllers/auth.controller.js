
const models = require('../database/models/index')
const errors = require('../const/error')
const bcrypt = require('bcryptjs')
const jwt = require('../middlewares/signJWT')
const rolservice = require("../services/rolservice")

module.exports = {
    login: async (req,res,next)=>{
        console.log(req.body)
        try{
            const user = await models.Usuario.findOne({
                where:{
                    mail:req.body.mail
                }
            })

            if (user){
                let coincide = bcrypt.compareSync(req.body.password,user.password)
                if (!coincide){
                    return next(errors.CredencialesInvalidas)
                }
            }

            if(!user){
                return next(errors.CredencialesInvalidas)
            }

            res.cookie("jwt", jwt(user))
            res.json({
                success:true,
                data:{
                    id:user.ID,
                    token:jwt(user)
                }
            })


        }catch (err){
            return next(err)
        }
    },

    registrarse: async (req,res,next)=>{
        try{

            const persona = await models.persona.findOne({
                where:{
                    legajo:req.body.legajo
                }
            })

            req.body.password = bcrypt.hashSync(req.body.password,10)
            const user = await models.usuario.create({
                mail:req.body.mail,
                password:req.body.password,
                rol:rolservice.rolByMail(req.body.mail) ? 'D' : 'A',
                persona_id:persona ? persona.ID : null
            })


            res.json({
                success:true,
                data:{
                    id:user.ID
                }
            })
        }catch (err){
            return next(err)
        }
    }

}