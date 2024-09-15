const transporter = require('../mailer/mailer')
const newUser = require('./templates/newUser')
const newPassword = require('./templates/newPassword')
const { NODEMAILER_USER } = process.env

const sendEmailWithTemplate = (to, template, props) => {
  console.log('Enviando Email...')
  let emailOptions

  switch (template) {
    case 'newUser':
      emailOptions = {
        from: NODEMAILER_USER,
        to,
        subject: 'Bienvenido a VENICE INDUMENTARIA',
        html: newUser({ email: to })
      }
      break

    case 'newPassword':
      emailOptions = {
        from: NODEMAILER_USER,
        to,
        subject: 'Recuperación de contraseña',
        html: newPassword({ email: to, password: props.password })
      }
      break

    default:
      emailOptions = {
        from: NODEMAILER_USER,
        to,
        subject: 'Testing email using templates',
        html: testing({ email: to })
      }
      break
  }

  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      console.log('Email error: ', error.message)
    } else {
      console.log('Email enviado satisfactoriamente 📧')
    }
  })
}

module.exports = sendEmailWithTemplate
