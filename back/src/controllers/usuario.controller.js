module.exports = {

    listar: async(req,res)=>{

    },

    crear: async(req,res)=>{

    },
    
    prueba: async(req,res)=>{
        try{
            console.log('ejec prueba')

            res.json({
                message:'Hello World'
            })
        }catch(error){
            console.error(error)
        }
    }

}