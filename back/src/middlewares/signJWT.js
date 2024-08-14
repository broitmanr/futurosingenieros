const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../const/globalConstant')

module.exports = function (usuario){
    if (usuario){
        const token = jwt.sign({
                id:usuario.ID,
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