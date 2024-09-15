const nodemailer = require('nodemailer')

const { NODEMAILER_HOST, NODEMAILER_PORT, NODEMAILER_USER, NODEMAILER_PASS } =
  process.env

const transporter = nodemailer.createTransport({
  service: 'outlook',
  host: NODEMAILER_HOST,
  port: NODEMAILER_PORT,
  secure: false,
  secureConnection: false,
  requireTLS: true,
  auth: {
    user: NODEMAILER_USER,
    pass: NODEMAILER_PASS
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
})

module.exports = transporter
