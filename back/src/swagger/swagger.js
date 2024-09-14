const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const { join } = require('path')
const fs = require('fs')
const pc = require('picocolors')

/**
 * Lee todos los archivos JSON en un directorio y los combina en un solo objeto.
 * @param {string} dir - Ruta del directorio que contiene los archivos JSON.
 * @returns {object} Un objeto combinado que contiene el contenido de todos los archivos JSON.
 */
const loadJsonFiles = (dir) => {
  return fs.readdirSync(dir).reduce((combinedContent, file) => {
    const fileContent = JSON.parse(fs.readFileSync(join(dir, file), 'utf-8'))
    return { ...combinedContent, ...fileContent }
  }, {})
}

// Cargar paths y components desde los directorios respectivos
const paths = loadJsonFiles(join(__dirname, 'paths'))
const components = loadJsonFiles(join(__dirname, 'components'))

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Backend de Futuros Ingenieros de la UTN FRLP 🎓',
      version: '1.0.0',
      description: 'Documentación de la API de usuarios y cursos para futuros ingenieros'
    },
    paths,
    components
  },
  apis: [] // Esta opción puede usarse para añadir anotaciones en archivos específicos
}

const swaggerSpec = swaggerJSDoc(options)

/**
 * Configura y sirve la documentación Swagger.
 * @param {object} app - La instancia de la aplicación Express.
 * @param {number} port - El puerto en el que la aplicación está escuchando.
 */
const swaggerDocs = (app, port) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })
  console.log(pc.bgBlue(`Swagger disponible en http://localhost:${port}/api/docs 👁️ 👁️ `))
}

module.exports = { swaggerDocs }
