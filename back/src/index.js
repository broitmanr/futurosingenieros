const express = require('express')
const { PORT } = require('./const/globalConstant')
const { rutasAuth, rutasInit } = require('./routes/index.routes')
// import sequelize from './config/database.js';
const errorHandler = require('./middlewares/error')
// import errorHandler from './middlewares/error.js';
// import cookieParser from 'cookie-parser';
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { swaggerDocs } = require('./swagger/swagger')
const manageTempFiles = require('./middlewares/archivosTemporales')
const { set } = require('./mailer/mailer')
const cron = require('node-cron')
const { verificarPenalidadesBackground } = require('./controllers/penalidad.controller')
// const { inicializarArchivosDesdeCarpeta } = require('./controllers/archivo.controller')
const {iniciarNotificacionesVencimiento} = require('./services/notificacionScheduler')
const {enviarNotificacionesVencimientoEntrega} = require("./services/notificacionService");
const configuracionApi = async (app) => {
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cors({
    origin: process.env.RUTA_FRONT, // La URL del frontend
    credentials: true // Esto permite que las cookies se envíen y reciban
  }))
  app.use(manageTempFiles) // Registrar y limpiar archivos temporales
  app.use(errorHandler)
}

const configuracionRouter = async (app) => {
  app.use(cookieParser())
  app.use('/api/', rutasInit())
  app.use('/', rutasAuth())
  app.use(errorHandler)
}

const init = async () => {
  const app = express()
  try {
    // await sequelize.authenticate();
    // sequelize.sync();
    console.log('Conexión establecida exitosamente.')
    app.listen(PORT, () => {
      console.log(`App escuchando en puerto ${PORT}`)
      swaggerDocs(app, PORT)
    })
  } catch (err) {
    console.error('Error al conectarse a la base:', err)
  }
  await configuracionApi(app)
  await configuracionRouter(app)
  // Ejecutar la verificación de penalidades cada día a las 00:00
  cron.schedule('0 0 * * *', () => {
    console.log('Ejecutando verificación de penalidades...')
    verificarPenalidadesBackground()
  })
  iniciarNotificacionesVencimiento()
  /* Usamos un timeout de unos 5 segundos para que asegurarnos que todo la bd se sincronice e iniciamos inicializarArchivosDesdeCarpeta
  setTimeout(() => {
    const imgFolder = '1m0G7726_malY8pAMFtMKhMXRIzW2GvMx'
    inicializarArchivosDesdeCarpeta(imgFolder)
  }, 10000) */
}

init()
