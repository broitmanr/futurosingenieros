const validate = (scheme) => {

    return(req,res,next)=>{
        let result = scheme.validate(req.body)
        if (result.error){
            next(result.error)
        } else{
            next()
        }
    }
}

export default validate;