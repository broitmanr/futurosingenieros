const request = require('supertest')
const bcrypt = require('bcryptjs')
const models = require('../../src/database/models')

class TestUsuarios {
    constructor() {
        this.usuarios = { alumno: null, docente: null }
        this.personas = { alumno: null, docente: null }
        this.tokens = { alumno: null, docente: null }
        this.notificaciones = []
        this.app = null // Nueva propiedad para almacenar la instancia de la app
    }

    setApp(app) {
        this.app = app
    }

    async initializeUsuarios() {
        try {
            console.log('Inicializando usuarios de prueba...')
            const hashedPassword = await bcrypt.hash('TestPass123', 10)
            await this.createPersonaYUsuario('alumno', 'alumno.test@alu.frlp.utn.edu.ar', hashedPassword, 'A')
            await this.createPersonaYUsuario('docente', 'docente.test@frlp.utn.edu.ar', hashedPassword, 'D')
            await this.loginUsuarios()
            await this.createNotificaciones()
        } catch (error) {
            console.error('Error al inicializar usuarios de prueba:', error)
        }
    }

    async createPersonaYUsuario(rol, mail, password, rolUsuario) {
        console.log(`Creando persona y usuario de prueba para el rol: ${rol}`)
        let persona = await models.Persona.findOne({ where: { legajo: rol === 'alumno' ? '12345' : '54321' } })
        if (!persona) {
            persona = await models.Persona.create({
                nombre: rol.charAt(0).toUpperCase() + rol.slice(1),
                apellido: 'Test',
                legajo: rol === 'alumno' ? '12345' : '54321',
                dni: rol === 'alumno' ? '12345678' : '87654321',
                rol: rol === 'alumno' ? 'A' : 'D'
            })
        }
        this.personas[rol] = persona

        let usuario = await models.Usuario.findOne({ where: { mail } })
        if (!usuario) {
            usuario = await models.Usuario.create({
                mail,
                password,
                rol: rolUsuario,
                persona_id: persona.ID
            })
        }
        this.usuarios[rol] = usuario
    }

    async loginUsuarios() {
        if (!this.app) {
            throw new Error('App not initialized. Call setApp() first.')
        }

        for (const rol of Object.keys(this.usuarios)) {
            const response = await request(this.app)
                .post('/auth/sign-in')
                .send({ mail: this.usuarios[rol].mail, password: 'TestPass123' })

            if (response.headers['set-cookie']) {
                const cookie = response.headers['set-cookie'][0]
                this.tokens[rol] = cookie.split(';')[0].split('=')[1]
            }
        }
    }

    async createNotificaciones() {
        console.log('Creando notificaciones de prueba...')

        try {
            let tipoNotificacion = await models.TipoNotificacion.findOne({ where: { detalle: 'Nueva actividad' } })
            console.log('Resultado de búsqueda de tipo de notificación previo al IF de creación:', tipoNotificacion)

            if (!tipoNotificacion) {
                tipoNotificacion = await models.TipoNotificacion.create({
                    detalle: 'Nueva actividad',
                    icono: 'actividad_icono'
                })
            }

            const notificationsData = [
                { detalle: 'TESTING 1' },
                { detalle: 'TESTING 2' }
            ]

            for (const { detalle } of notificationsData) {
                let notificacion = await models.Notificacion.findOne({ where: { detalle } })
                console.log(`Resultado de búsqueda de ${detalle} previo a la creación:`, notificacion)

                if (!notificacion) {
                    notificacion = await models.Notificacion.create({
                        detalle,
                        leido: false,
                        usuario_id: this.usuarios.alumno.ID,
                        tipoNotificacion_id: tipoNotificacion.ID,
                        fecha: new Date(),
                        updated_at: new Date()
                    })
                    this.notificaciones.push(notificacion)
                }
            }
        } catch (error) {
            console.error('Error al crear notificaciones:', error)
        }
    }

    async cleanupUsuarios() {
        try {
            console.log('Limpiando usuarios de prueba...')

            // Eliminar notificaciones primero
            await models.Notificacion.destroy({
                where: {
                    usuario_id: {
                        [models.Sequelize.Op.in]: [
                            this.usuarios.alumno ? this.usuarios.alumno.ID : null,
                            this.usuarios.docente ? this.usuarios.docente.ID : null
                        ]
                    }
                }
            })
            console.log('Notificaciones eliminadas.')
            // Eliminar tipo de notificación
            await models.TipoNotificacion.destroy({
                where: {
                    detalle: 'Nueva actividad',
                    icono: 'actividad_icono'
                }
            })
            console.log('Tipo de notificación eliminado.')
            // Eliminar usuarios después
            await models.Usuario.destroy({
                where: {
                    mail: {
                        [models.Sequelize.Op.in]: [
                            'alumno.test@alu.frlp.utn.edu.ar',
                            'docente.test@frlp.utn.edu.ar'
                        ]
                    }
                }
            })
            console.log('Usuarios eliminados.')
            await models.Persona.destroy({
                where: {
                    legajo: {
                        [models.Sequelize.Op.in]: [
                            '12345',
                            '54321'
                        ]
                    }
                }
            })
            console.log('Personas eliminadas.')
        } catch (error) {
            console.error('Error al limpiar usuarios de prueba:', error)
        }
    }

    getAuthenticatedRequest(rol = 'alumno') {
        if (!this.app) {
            throw new Error('App not initialized. Call setApp() first.')
        }
        const agent = request.agent(this.app)
        agent.set('Cookie', [`jwt=${this.tokens[rol]}`])
        return agent
    }
}

module.exports = new TestUsuarios()
