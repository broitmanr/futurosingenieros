import errors from '../const/error.js'

export default function (err,req,res,next){

    let response ={
        success:false,
        error:{
            code:err.code || 500,
            message:err.message || "Internal server error"
        }
    }

    if (err.isJoi){
        let errorType = err.details[0].type
        let errorKey = 'validationError'

        if (errorType === 'any.required'){
            errorKey = 'FaltanCampos'
        }

        response.error.code = errors[errorKey].code
        response.error.message = errors[errorKey].message

    }
}