const nodemailer = require('nodemailer')

const { NODEMAILER_PORT, NODEMAILER_HOST, NODEMAILER_FROM, NODEMAILER_PASS } = process.env
const transporter = nodemailer.createTransport({
  host: NODEMAILER_HOST, // Cambia a la dirección SMTP de tu poste.io
  port: NODEMAILER_PORT, // Puerto SMTP, puede ser 587 (STARTTLS) o 465 (SSL/TLS)
  secure: false, // true para el puerto 465, false para otros puertos (STARTTLS)
  auth: {
    user: NODEMAILER_FROM,
    pass: NODEMAILER_PASS // La contraseña de la cuenta de correo
  },
  tls: {
    rejectUnauthorized: false
  }
})

module.exports = transporter
