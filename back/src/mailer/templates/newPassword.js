const newPassword = (props) => {
  return `
      <head>
      <title>Recuperación de Contraseña</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.5;
          box-sizing: border-box;
        }
  
    
        img {
          max-width: 80%;
          display: block; 
          margin: 0 auto; 
      }
  
  
        h1, h2, h3 {
          font-weight: bold;
        }
        h3 {
          text-align: center;
          font-size: 2.5em; 
          color: #555; 
          margin-bottom: 0.5em;
          font-size: xx-large;
      }
        p {
          margin-bottom: 1.5em;
          text-align: justify;
        }
       
        a {
          color: #D4AC0D;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
        <img src="https://res.cloudinary.com/dmfzplfra/image/upload/v1711678602/VENICE/LOGO_1-removebg-preview_j1tfcu.png" alt="venice logo"/>
        <h3>Buenas Prendas 🤙</h3>
        
        <p><b>Hola ${props.email},</b></p>
        <p>Te enviamos este mensaje porque solicitaste restablecer tu contraseña en Comunidad VENICE. Estamos acá para ayudarte a recuperar el acceso a tu cuenta de forma segura y sencilla.</p>
        <p>Sabemos lo importante que es para vos mantener la seguridad de tu cuenta, por eso creamos un proceso fácil y seguro para restablecer tu contraseña.</p>
        <p>Tu nueva contraseña es <b>${props.password}</b></p>
        <p> Ingresá a nuestra página <a href="https://venice-nine.vercel.app/">Aquí</a>; y cambiala por una de tu agrado.</p>
        <p>¡Gracias por confiar en nosotros!</p>
        <p>Nos estamos viendo,</p>
        <p><b>Comunidad VENICE</b></p>
      </body>
    </html>`
}

module.exports = newPassword
