import jwt from 'jsonwebtoken'
import {JWT_SECRET} from '../const/globalConstant.js'

export default function (usuario){
    if (usuario){
        const token = jwt.sign({
                id:usuario.id
            },
            JWT_SECRET,
            {
                expiresIn: '3000m'
            }
        )
        return token
    }else{
        return null
    }

}