const testUsuarios = require('../../helpers/authTestHelper')
const { createApp, startServer } = require('../../../src/index')
const models = require('../../../src/database/models')

let server
let app

describe('Pruebas de Autenticación - Integración', () => {
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

  it('Debería devolver un token y datos del usuario en un inicio de sesión exitoso', async () => {
    const response = await testUsuarios.getAuthenticatedRequest('alumno')
      .post('/auth/sign-in')
      .send({ mail: 'alumno.test@alu.frlp.utn.edu.ar', password: 'TestPass123' })

    console.log('Respuesta:', response.body)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })

  it('Debería devolver un token y datos del usuario en un inicio de sesión exitoso para el docente', async () => {
    const response = await testUsuarios.getAuthenticatedRequest('docente')
      .post('/auth/sign-in')
      .send({ mail: 'docente.test@frlp.utn.edu.ar', password: 'TestPass123' })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveProperty('token')
  })

  describe('POST /auth/sign-up', () => {
    it('Debería registrar un nuevo usuario y enviar un correo de confirmación', async () => {
      const response = await testUsuarios.getAuthenticatedRequest('docente')
        .post('/auth/sign-up')
        .send({ mail: 'nuevoAlumno@alu.frlp.utn.edu.ar', password: 'TestPass123', legajo: '12345' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('Debería manejar errores y llamar a next con el error', async () => {
      models.Persona.findOne = jest.fn().mockRejectedValue(new Error('Error generico'))

      const response = await testUsuarios.getAuthenticatedRequest('docente')
        .post('/auth/sign-up')
        .send({ mail: 'nuevoAlumno@alu.frlp.utn.edu.ar', password: 'TestPass123', legajo: '12345' })

      expect(response.status).toBe(500)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toHaveProperty('message', 'Error generico')
    })
  })

  describe('POST /auth/sign-out', () => {
    it('Debería limpiar la cookie jwt y devolver un "success"', async () => {
      const response = await testUsuarios.getAuthenticatedRequest('docente')
        .post('/auth/sign-out')
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })
})
