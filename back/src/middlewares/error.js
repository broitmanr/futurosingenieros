const errors = require('../const/error')


module.exports = function (err,req,res,next){

    let response ={
        success:false,
        error:{
            code:err.code || 500,
            message:err.message || "Internal server error"
        }
    }


    if (err.isJoi){
        let errorType = err.details[0].type
        let errorKey = 'ValidationError'

        if (errorType === 'any.required'){
            errorKey = 'FaltanCampos'
        }

        response.error.code = errors[errorKey].code
        response.error.message = errors[errorKey].message

    }

    res.status(200).json(response)
}