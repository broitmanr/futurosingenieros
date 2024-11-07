const { alumno } = require('../../../src/controllers/rendimiento.controller')
const models = require('../../../src/database/models')

jest.mock('../../../src/database/models')

describe('Controlador de Rendimiento', () => {
  describe('Metodo: alumno', () => {
    it('Debería devolver el rendimiento de un alumno con el cálculo de la nota promedio correcto', async () => {
      // Fix: Properly structure the request object
      const req = {
        params: {
          cursoId: 1
        }
      }

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: {
          usuario: {
            rol: 'A',
            persona_id: 1
          }
        }
      }

      const next = jest.fn()

      // Mock de datos de prueba
      const entregasRealizadas = [
        {
          ID: 1,
          Entregas: [
            {
              ID: 1,
              fecha: '2023-01-01',
              nota: 8,
              PersonaXEntregas: [{ porcentaje_participacion: 100 }]
            }
          ],
          InstanciaEvaluativa: { ID: 1, nombre: 'Parcial 1' }
        },
        {
          ID: 2,
          Entregas: [
            {
              ID: 2,
              fecha: '2023-02-01',
              nota: 7,
              PersonaXEntregas: [{ porcentaje_participacion: 100 }]
            }
          ],
          InstanciaEvaluativa: { ID: 2, nombre: 'Parcial 2' }
        },
        {
          ID: 3,
          Entregas: [
            {
              ID: 3,
              fecha: '2023-03-01',
              nota: 9,
              PersonaXEntregas: [{ porcentaje_participacion: 100 }]
            }
          ],
          InstanciaEvaluativa: { ID: 3, nombre: 'Parcial 3' }
        }
      ]

      const entregasPactadas = [
        { ID: 1, nombre: 'Parcial 1', fechavto1: '2023-01-01', fechavto2: '2023-01-15', InstanciaEvaluativa: { ID: 1, nombre: 'Parcial 1' } },
        { ID: 2, nombre: 'Parcial 2', fechavto1: '2023-02-01', fechavto2: '2023-02-15', InstanciaEvaluativa: { ID: 2, nombre: 'Parcial 2' } },
        { ID: 3, nombre: 'Parcial 3', fechavto1: '2023-03-01', fechavto2: '2023-03-15', InstanciaEvaluativa: { ID: 3, nombre: 'Parcial 3' } }
      ]

      // Fix: Add proper mock implementations for all database calls
      models.EntregaPactada.findAll
        .mockResolvedValueOnce(entregasRealizadas)
        .mockResolvedValueOnce(entregasPactadas)

      models.Curso.findByPk.mockResolvedValue({
        ID: 1,
        Materium: { nombre: 'Sistemas y Organizaciones' },
        Comision: { nombre: 'S10' }
      })

      models.Penalidad.count.mockResolvedValue(0)
      models.Inasistencia.count.mockResolvedValue(0)

      // Fix: Mock Persona.findOne with proper group data
      models.Persona.findOne.mockResolvedValue({
        nombre: 'Test',
        apellido: 'Student',
        legajo: '12345',
        Grupos: [{
          nombre: 'Grupo Test',
          numero: 1
        }]
      })

      await alumno(req, res, next)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        alumno: expect.any(Object),
        curso: expect.any(Object),
        penalidades: expect.any(Number),
        inasistencias: expect.any(Number),
        entregasAgrupadas: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            nombre: expect.any(String),
            entregas: expect.any(Array)
          })
        ])
      }))

      // Verificar el cálculo de la nota promedio
      const response = res.json.mock.calls[0][0]
      const notas = response.entregasAgrupadas
        .flatMap(group => group.entregas
          .filter(e => e.entrega && e.entrega.nota !== null)
          .map(e => e.entrega.nota))

      const promedio = notas.reduce((acc, nota) => acc + nota, 0) / notas.length
      console.log('Promedio de notas del test unit de rendimiento:', promedio)
      expect(promedio).toBeCloseTo(8) // Promedio de 8, 7 y 9 es 8
    })
  })
})
