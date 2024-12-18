const transporter = require('./mailer')
const { func } = require('joi')

const { NODEMAILER_FROM } = process.env

async function mailRegistro (mail, nombre) {
  const mailOptions = {
    from: NODEMAILER_FROM, // Dirección del remitente
    to: mail, // Dirección del destinatario (usuario registrado)
    subject: '¡Felicitaciones por tu registro!', // Asunto del correo
    text: `Hola ${nombre}, felicitaciones por registrarte en nuestro sitio.`, // Texto en plano
    html: `
        <img src="cid:logo@empresa.com" alt="Logo de la Empresa" style="width: 200px;"/><br><hr>
        <p>Hola <b>${nombre}</b>, felicitaciones por registrarte en nuestro sitio.</p><hr>
        <p>Ahora seras una persona mas feliz</p>`,
    attachments: [
      {
        filename: 'logo.png', // Archivo de imagen del logotipo
        path: '../back/src/utils/logo.png', // Ruta a la imagen en tu servidor local
        cid: 'logo@empresa.com' // El Content-ID que se usará en el HTML
      }
    ]
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo:', error)
      return 'error'
    }
    console.log('Correo enviado:', info.response)
    return 'success'
  })
}


async function mailEntrega (mail, nombre) {
  const mailOptions = {
    from: NODEMAILER_FROM, // Dirección del remitente
    to: mail, // Dirección del destinatario (usuario registrado)
    subject: '¡Felicitaciones por tu registro!', // Asunto del correo
    text: `Hola ${nombre}, felicitaciones por registrarte en nuestro sitio.`, // Texto en plano
    html: `
        <img src="cid:logo@empresa.com" alt="Logo de la Empresa" style="width: 200px;"/><br><hr>
        <p>Entrega Pendiente ....</p>`,
    attachments: [
      {
        filename: 'logo.png', // Archivo de imagen del logotipo
        path: '../back/src/utils/logo.png', // Ruta a la imagen en tu servidor local
        cid: 'logo@empresa.com' // El Content-ID que se usará en el HTML
      }
    ]
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo:', error)
      return 'error'
    }
    console.log('Correo enviado:', info.response)
    return 'success'
  })
}


async function mailEntrega(mails, mensajePersonalizado) {
  const mailOptions = {
    from: NODEMAILER_FROM,
    to: mails.join(','), // Lista de destinatarios separados por coma
    subject: 'Recordatorio de entrega pendiente',
    text: mensajePersonalizado, // Texto en plano
    html: `
        <img src="cid:logo@empresa.com" alt="Logo de la Empresa" style="width: 200px;"/><br><hr>
        <p>${mensajePersonalizado}</p>`,
    attachments: [
      {
        filename: 'logo.png',
        path: '../back/src/utils/logo.png',
        cid: 'logo@empresa.com'
      }
    ]
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo:', error);
        reject(error);
      } else {
        console.log('Correo enviado:', info.response);
        resolve('success');
      }
    });
  });
}


module.exports = {
  mailRegistro, mailEntrega
}
