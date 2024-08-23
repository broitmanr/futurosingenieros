const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
// const {use} = require("express/lib/router");
// const { Router } = require('express')


const options = {
    apis:["src/routes/index.routes.js"],
    definition:{
        openapi:"3.0.0",
        info:{title:"Futuros Ingenieros API", version:"1.0.0"}
    },
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app,port) =>{
    app.use('/api/docs',swaggerUi.serve,swaggerUi.setup(swaggerSpec))
    app.get('/api/docs.json',(req,res)=>{
        res.setHeader('Content-Type','application/json')
        res.send(swaggerSpec)
    })

    console.log("👁️👁 Swagger disponible")
}

module.exports = { swaggerDocs }
