const transporter = require('./mailer')
const { func } = require('joi')

const { NODEMAILER_FROM } = process.env

async function mailRegistro (mail, nombre) {
  const mailOptions = {
    from: NODEMAILER_FROM,
    to: mail,
    subject: '¡Felicitaciones por tu registro!',
    text: `Hola ${nombre}, felicitaciones por registrarte en nuestro sitio.`,
    html: `
    <div style="font-family: Arial, sans-serif; color: #333333; max-width: 600px; margin: 0 auto;">      
      <div style="padding: 10px;">
        <p style="font-size: 16px;">¡Hola ${nombre}!</p>
        <p style="font-size: 16px;">¡Felicitaciones por registrarte en FI! 
        Ahora no te vas a perder de ninguna entrega </p>
      </div>
      <hr style="border: none; border-top: 1px solid #dddddd; margin: 10px 0;">
      <div style="text-align: center; padding: 10px;">
        <img src="cid:logo@empresa.com" alt="Logo Futuros Ingenieros" style="width: 120px; height: auto;"/>
      </div>
    </div>`,
    attachments: [
      {
        filename: 'logo.png',
        path: '../back/src/utils/logo.png',
        cid: 'logo@empresa.com'
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


// async function mailEntrega (mail, nombre) {
//   const mailOptions = {
//     from: NODEMAILER_FROM, // Dirección del remitente
//     to: mail, // Dirección del destinatario (usuario registrado)
//     subject: '¡Felicitaciones por tu registro!', // Asunto del correo
//     text: `Hola ${nombre}, felicitaciones por registrarte en nuestro sitio.`, // Texto en plano
//     html: `
//         <img src="cid:logo@empresa.com" alt="Logo de la Empresa" style="width: 200px;"/><br><hr>
//         <p>Entrega Pendiente ....</p>`,
//     attachments: [
//       {
//         filename: 'logo.png', // Archivo de imagen del logotipo
//         path: '../back/src/utils/logo.png', // Ruta a la imagen en tu servidor local
//         cid: 'logo@empresa.com' // El Content-ID que se usará en el HTML
//       }
//     ]
//   }
//
//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error('Error al enviar el correo:', error)
//       return 'error'
//     }
//     console.log('Correo enviado:', info.response)
//     return 'success'
//   })
// }


async function mailEntrega(mails, mensajePersonalizado) {
  const mailOptions = {
    from: NODEMAILER_FROM,
    to: mails.join(','), // Lista de destinatarios separados por coma
    subject: 'Recordatorio de entrega pendiente',
    text: mensajePersonalizado, // Texto en plano
    html: `
        <div style="font-family: Arial, sans-serif; color: #333333; max-width: 600px; margin: 0 auto;">
        <hr style="border: none; border-top: 1px solid #dddddd; margin: 10px 0;">
        <div style="padding: 10px;">
        <p style="font-size: 16px;">${mensajePersonalizado}</p>
        </div>
        
        <div style="text-align: center; padding: 10px;">
         <img src="cid:logo@empresa.com" alt="Logo Futuros Ingenieros" style="width: 200px; height: auto;"/>
        </div>
  </div>`,
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
