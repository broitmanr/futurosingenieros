const express = require('express')
const { PORT } = require('./const/globalConstant')
const { rutasAuth, rutasInit } = require('./routes/index.routes')
const errorHandler = require('./middlewares/error')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { swaggerDocs } = require('./swagger/swagger')
const manageTempFiles = require('./middlewares/archivosTemporales')
const { set } = require('./mailer/mailer')
const cron = require('node-cron')
const { verificarPenalidadesBackground } = require('./controllers/penalidad.controller')
// const { inicializarArchivosDesdeCarpeta } = require('./controllers/archivo.controller')
const { iniciarNotificacionesVencimiento } = require('./services/notificacionScheduler')
const { enviarNotificacionesVencimientoEntrega } = require('./services/notificacionService')

const configuracionApi = async (app) => {
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cors({
    origin: process.env.RUTA_FRONT,
    credentials: true
  }))
  app.use(manageTempFiles)
  app.use(errorHandler)
}

// Configuración de rutas
const configuracionRouter = (app) => {
  app.use(cookieParser())
  app.use('/api/', rutasInit())
  app.use('/', rutasAuth())
  app.use(errorHandler)
}

function createApp() {
  const app = express()
  configuracionApi(app)
  configuracionRouter(app)
  iniciarNotificacionesVencimiento()

  // Ruta de salud para verificar que el servidor este corriendo
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' })
  })
  return app
}

function startServer(app, port) {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`)
      swaggerDocs(app, port)

      // Configurar cron job
      cron.schedule('0 0 * * *', () => {
        console.log('Ejecutando verificación de penalidades...')
        verificarPenalidadesBackground()
      })

      resolve(server)
    })
  })
}

// Se inicia el servidor si es el archivo principal y no cuando se requiere como un modulo en otros archivos (ej: tests)
if (require.main === module) {
  const app = createApp()
  startServer(app, PORT).catch(err => {
    console.error('Error al conectarse a la base:', err)
  })
}

// Exportar funciones para poder ser utilizadas en tests
module.exports = {
  createApp,
  startServer
}
