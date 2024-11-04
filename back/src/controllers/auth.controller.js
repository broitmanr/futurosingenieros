const models = require('../database/models/index')
const errors = require('../const/error')
const bcrypt = require('bcryptjs')
const transporter = require('../mailer/sendEmailWithTemplate')
const jwt = require('../middlewares/signJWT')
const rolservice = require('../services/rolservice')
const isPasswordValid = require('../const/passwordValidation')
const {Op} = require("sequelize");

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
      const { legajo, password,email,confirmEmail,confirmPassword } = req.body

      if (password !== confirmPassword){
        return next({...errors.ConflictError,details:'Ambas contraseñas deben coincidir'})
      }

      if (email !== confirmEmail){
        return next({...errors.ConflictError,details:'Ambos mails deben coincidir'})
      }



      if (!isPasswordValid(req.body.password)) {
        return next({
          ...errors.ValidationError,
          details: 'La contraseña debe tener al menos 8 caracteres alfanuméricos'
        })
      }

      const usuario = await models.Usuario.findOne({
        where:{
          mail:email,
        }
      })

      if (usuario){
        return next({
          ...errors.ConflictError,
          details: 'Ya existe un usuario con ese email'
        })
      }

      const persona = await models.Persona.findOne({
        where: {
          legajo: legajo
        },
        include:{model:models.Usuario, required:false}
      })

      if (!persona) {
        res.status(404).json({
          persona_id: null
        })
      }

      if (persona.Usuario){
        return next({
          ...errors.ConflictError,
          details: 'La persona que desea registrar ya tiene un usuario registrado'
        })
      }

      // Todo: verificar que el mail termine o con frlp.utn.edu.ar
      if (!rolservice.isFrlpMail(email)){
        return next({
          ...errors.ConflictError,
          details: 'El mail debe ser emitido por la UTN FRLP'
        })
      }

      const passwordHashed= bcrypt.hashSync(password, 10)

      const user = await models.Usuario.create({
        mail: email,
        password: passwordHashed,
        rol: rolservice.rolByMail(email) ? 'D' : 'A',
        persona_id: persona ? persona.ID : null
      })

      const name = persona ? persona.nombre : user.mail.split('@')[0]

      try {
        // await transporter.mailRegistro(email, name)
      } catch (e) {

        return next({ ...errors.InternalServerError, details:'No se pudo enviar mail de registro'})
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

  registrarseDe0: async (req, res, next) => {
    try {
      const { legajo, password,email,confirmEmail,confirmPassword } = req.body.usuario
      const { nombre, apellido,documento} = req.body.persona


      if (password !== confirmPassword){
        return next({...errors.ConflictError,details:'Ambas contraseñas deben coincidir'})
      }

      if (email !== confirmEmail){
        return next({...errors.ConflictError,details:'Ambos mails deben coincidir'})
      }



      if (!isPasswordValid(req.body.password)) {
        return next({
          ...errors.ValidationError,
          details: 'La contraseña debe tener al menos 8 caracteres alfanuméricos'
        })
      }

      const usuario = await models.Usuario.findOne({
        where:{
          mail:email,
        }
      })

      if (usuario){
        return next({
          ...errors.ConflictError,
          details: 'Ya existe un usuario con ese email'
        })
      }

      const persona = await models.Persona.findOne({
        where: {
          [Op.or]: [{ legajo: legajo }, { dni: documento }],
        },
        include:{model:models.Usuario, required:false}
      })

      if (persona){
        return next({
          ...errors.ConflictError,
          details: 'Ya existe una persona registrada con esos datos'
        })
      }

      const personaNew = await models.Persona.create({
        nombre: nombre,
        apellido: apellido,
        dni: documento,
        rol: rolservice.rolByMail(req.body.mail) ? 'D' : 'A',
      })

      // Todo: verificar que el mail termine o con frlp.utn.edu.ar
      if (!rolservice.isFrlpMail(email)){
        return next({
          ...errors.ConflictError,
          details: 'El mail debe ser emitido por la UTN FRLP'
        })
      }

      const passwordHashed= bcrypt.hashSync(password, 10)

      const user = await models.Usuario.create({
        mail: email,
        password: passwordHashed,
        rol: rolservice.rolByMail(email) ? 'D' : 'A',
        persona_id: personaNew.ID
      })

      const name = personaNew ? personaNew.nombre : user.mail.split('@')[0]

      try {
        // await transporter.mailRegistro(email, name)
      } catch (e) {

        return next({ ...errors.InternalServerError, details:'No se pudo enviar mail de registro'})
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
