const models = require('../database/models/index')
const errors = require('../const/error')
const bcrypt = require('bcryptjs')
const transporter = require('../mailer/sendEmailWithTemplate')
const jwt = require('../middlewares/signJWT')
const rolservice = require('../services/rolservice')
const isPasswordValid = require('../const/passwordValidation')

module.exports = {
  login: async (req, res, next) => {
    console.log(req.body)
    try {
      const user = await models.Usuario.findOne({
        where: {
          mail: req.body.mail
        },
        include: [
          {
            model: models.Persona,
            attributes: ['nombre', 'apellido']
          }]
      })

      if (user) {
        const coincide = bcrypt.compareSync(req.body.password, user.password)
        if (!coincide) {
          return next(errors.CredencialesInvalidas)
        }
      }

      if (!user) {
        return next(errors.CredencialesInvalidas)
      }

      res.cookie('jwt', jwt(user))
      res.json({
        success: true,
        data: {
          id: user.ID,
          token: jwt(user),
          role: user.rol,
          name: user.Persona?.nombre + ' ' + user.Persona?.apellido ?? null
        }
      })
    } catch (err) {
      return next(err)
    }
  },

  registrarse: async (req, res, next) => {
    try {
      // Validar la contraseña
      if (!isPasswordValid(req.body.password)) {
        return next({
          ...errors.ValidationError,
          details: 'La contraseña debe tener al menos 8 caracteres alfanuméricos'
        })
      }

      const persona = await models.Persona.findOne({
        where: {
          legajo: req.body.legajo
        }
      })
      // Todo: verificar que el mail termine o con frlp.utn.edu.ar
      req.body.password = bcrypt.hashSync(req.body.password, 10)
      // const user = await models.Usuario.create({
      //   mail: req.body.mail,
      //   password: req.body.password,
      //   rol: rolservice.rolByMail(req.body.mail) ? 'D' : 'A',
      //   persona_id: persona ? persona.ID : null
      // })

      const nombre = persona ? persona.nombre : user.mail.split('@')[0]

      try {
        await transporter.mailRegistro(req.body.mail, nombre)
      } catch (e) {
        console.log('Error al enviar mail de registro:', e)
        return next({ ...errors.InternalServerError, details: e.message })
      }

      res.json({
        success: true,
        data: {
          // id: user.ID
        }
      })
    } catch (err) {
      return next(err)
    }
  },
  logout: async (req, res, next) => {
    res.clearCookie('jwt')
    res.json({ success: true })
  }

}
