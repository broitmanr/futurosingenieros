const newUser = (props) => {
  return `
    <head>
    <title>Bienvenido a Futuros Ingenieros</title>
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
      
      <h3>Bienvenid@🤙</h3>
      
      <p><b>Hola ${props.nombre},</b></p>
        <hr>
       <p>¡Bienvenido/a a nuestro sistema de seguimiento de trabajos! Sabemos que la vida universitaria puede ser bastante ajetreada, así que hemos creado esta herramienta para hacerte las cosas más fáciles.<br>
       Acá vas a poder:</p>
        <ul>
        <li>Subir tus trabajos de manera rápida y sin complicaciones.</li>
        <li>Recibir recordatorios cuando se acerque la fecha de entrega, para que no te agarren los plazos de sorpresa.</li>
        <li>Ver las correcciones y comentarios de tus profesores para que puedas mejorar cada vez más.</li>
        <li>Organizar grupos de trabajo y coordinar fácilmente con tus compañeros.</li>
        </ul>
        <br><br>
        <p>La idea es que puedas enfocarte en tus estudios y proyectos, mientras nosotros te ayudamos a mantener todo bajo control. Si te surge alguna duda o necesitas ayuda, no dudes en contactarnos. ¡Estamos para darte una mano!
         <br>¡Mucho éxito en todo lo que viene!</p>
        <br><hr>
        Saludos,
        Equipo de Soporte Académico
       </p>    
  </body>
  </html>`
}

module.exports = newUser
