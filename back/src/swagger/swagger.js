const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const {join} = require("path");
// const {use} = require("express/lib/router");
// const { Router } = require('express')


const options = {
    definition: {
        openapi:'3.0.0',
        info: {
            title: "API de Autenticación y Cursos",
            version: "1.0.0",
            description: "Documentación de la API de usuarios y cursos.",
        },
    },
    apis:[join(__dirname, '/paths/auth.json')]
        // join(__dirname, './components/*.json'), // Referencia a los componentes en JSON

};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app,port) =>{
    console.log("aaaa"+join(__dirname, '/paths/auth.json'))
    app.use('/api/docs',swaggerUi.serve,swaggerUi.setup(swaggerSpec))
    app.get('/api/docs.json',(req,res)=>{
        res.setHeader('Content-Type','application/json')
        res.send(swaggerSpec)
    })

    console.log("👁️👁 Swagger disponible")
}

module.exports = { swaggerDocs }
