require('dotenv').config({ path: './.env' })
const models = require('../../src/database/models')
const cron = require('node-cron')

let server

// Configuración global de tests
beforeAll(async () => {
  // Esperar a que la conexión a la base de datos esté lista
  await models.syncPromise
})

afterAll(async () => {
  // Cerrar la conexión a la base de datos
  await models.sequelize.close()

  // Cerrar el servidor HTTP si está definido
  if (server && server.close) {
    await new Promise((resolve) => {
      server.close(() => {
        console.log('Test server closed')
        resolve()
      })
    })
  }

  // Detener todas las tareas programadas de cron
  const scheduledTasks = cron.getTasks()
  scheduledTasks.forEach(task => task.stop())
})
