
import usuario from '../models/usuario.js'
import errors from '../const/error.js'
import bcrypt from 'bcryptjs'
import jwt from '../middlewares/signJWT.js'

export default {
    login: async (req,res,next)=>{
        console.log(req.body)
        try{
            const user = await usuario.findOne({
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

            res.json({
                success:true,
                data:{
                    id:user.id,
                    token:jwt(user)
                }
            })


        }catch (err){
            return next(err)
        }
    }

}