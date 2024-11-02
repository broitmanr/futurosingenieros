const { registrarse } = require('../../../src/controllers/auth.controller')
const models = require('../../../src/database/models')
const bcrypt = require('bcryptjs')
const mockData = require('../fixtures/mockData')

jest.mock('../../../src/database/models')
jest.mock('bcryptjs')

describe('Controlador de Autenticación', () => {
  describe('Metodo: registrarse', () => {
    it('Debería rechazar una contraseña que no sea válida', async () => {
      const req = { body: { mail: 'test@mail.com', password: 'short', legajo: '12345' } }
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
      const next = jest.fn()

      await registrarse(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        code: 400,
        message: 'Error de validación',
        details: 'La contraseña debe tener al menos 8 caracteres alfanuméricos'
      }))
    })

    it('Debería aceptar una contraseña válida', async () => {
      const req = { body: { mail: mockData.usuarioAlumno.mail, password: mockData.usuarioAlumno.password, legajo: mockData.usuarioAlumno.Persona.legajo } }
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() }
      const next = jest.fn()

      models.Persona.findOne.mockResolvedValue(mockData.usuarioAlumno.Persona)
      models.Usuario.create.mockResolvedValue({ ID: 1, mail: mockData.usuarioAlumno.mail, rol: mockData.usuarioAlumno.rol, persona_id: mockData.usuarioAlumno.Persona.ID })
      bcrypt.hashSync.mockReturnValue('hashedpassword')

      await registrarse(req, res, next)

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true
      }))
    })
  })
})
