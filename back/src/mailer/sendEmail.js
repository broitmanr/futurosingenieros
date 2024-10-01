const { transporter } = require('back/src/mailer/mailer')
const { NODEMAILER_USER } = process.env

const sendEmail = (to, subject, html) => {
  console.log('Enviando Email...')
  const emailOptions = {
    from: NODEMAILER_USER,
    to,
    subject,
    html:
      html ||
      '<h1>Email testing</h1>'
  }

  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      console.log('Email error: ', error.message)
    } else {
      console.log('Email enviado satisfactoriamente 📧')
    }
  })
}

module.exports = sendEmail
