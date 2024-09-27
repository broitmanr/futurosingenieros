const nodemailer = require('nodemailer')

const { NODEMAILER_HOST, NODEMAILER_PORT, NODEMAILER_USER, NODEMAILER_PASS } =
  process.env

const transporter = nodemailer.createTransport({
  host: 'mail.futurosingenieros.site',
  port: NODEMAILER_PORT,
  secure: false,
  // secureConnection: true,
  // requireTLS: true,
  auth: {
    user: 'gerencia@futurosingenieros.site',
    pass: 'PAGApk5dKD'
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
})


module.exports = transporter;


