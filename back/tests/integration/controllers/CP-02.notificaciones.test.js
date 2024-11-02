const testUsuarios = require('../../helpers/authTestHelper')
const { createApp, startServer } = require('../../../src/index')
const models = require('../../../src/database/models')

let server
let app

describe('Controlador de Notificaciones - Integración', () => {
  beforeAll(async () => {
    // Crear la aplicación
    app = createApp()

    // Asignar la app al helper de tests
    testUsuarios.setApp(app)

    // Iniciar el servidor
    server = await startServer(app, 0) // Usar un puerto aleatorio disponible
    console.log(`El test server está corriendo en el puerto: ${server.address().port}`)

    // Inicializar usuarios de prueba
    await testUsuarios.initializeUsuarios()
  })

  afterAll(async () => {
    // Limpiar usuarios de prueba
    await testUsuarios.cleanupUsuarios()

    // Cerrar la conexión a la base de datos
    await models.sequelize.close()

    // Cerrar el servidor HTTP
    if (server && server.close) {
      await new Promise((resolve) => {
        server.close(() => {
          console.log('-- Test server cerrado --')
          resolve()
        })
      })
    }
  })

  it('Debería listar las notificaciones del usuario', async () => {
    const response = await testUsuarios.getAuthenticatedRequest('alumno')
      .get('/api/notificacion/')

    console.log('Respuesta de la solicitud:', response.body)

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
    expect(response.body[0]).toHaveProperty('detalle', 'TESTING 1')
    expect(response.body[1]).toHaveProperty('detalle', 'TESTING 2')
  })

  it('Debería listar las notificaciones del usuario', async () => {
    const response = await testUsuarios.getAuthenticatedRequest('alumno')
      .get('/api/notificacion/test')

    console.log('Respuesta de la solicitud de prueba:', response.body)

    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Ruta de prueba funcionando correctamente')
  })
})
