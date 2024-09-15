const newUser = (props) => {
  return `
    <head>
    <title>Bienvenido a VENICE IDUMENTARIA</title>
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
      <p>¡Bienvenido a Venice! Estamos emocionados de tenerte en nuestra comunidad de amantes de las remeras originales. Sabemos que encontrar prendas únicas y de calidad puede ser todo un desafío, especialmente cuando buscas algo que refleje tu estilo personal. Es por eso que creamos Venice, para ofrecerte una amplia selección de remeras originales y de excelente calidad..</p>
      <p>¿Alguna vez sentiste que queres destacarte con una remera única pero no sabes dónde encontrarla? Estamos acá para resolver ese problema. Simplemente descubrí nuestra colección y encontrarás una variedad de remeras originales que se adaptan a tu estilo y personalidad.</p>
      <p>Además, nos aseguramos de que nuestras remeras sean de la mejor calidad, para que te sientas cómodo y seguro luciéndolas. Y si estás buscando algo específico, nuestro equipo está aquí para ayudarte a encontrar la remera perfecta para ti.</p>
      <p>Queremos que disfrutes vistiendo remeras originales, por eso hemos hecho Venice lo más fácil posible para vos. Además, estamos constantemente agregando nuevas colecciones y diseños para mantenerte actualizado con las últimas tendencias en moda.</p>
      <p>¿Estás listo para explorar nuestra colección?  ¡Visita nuestro sitio web <a href="https://venice-nine.vercel.app/">Ingresar</a> y encontrá la remera original perfecta para vos hoy mismo!</p>
      <p>Nos estamos viendo!,</p>
      <p><b>Comunidad VENICE</b></p>
      <p><b>P.D.</b> No te pierdas nuestras novedades y promociones especiales. Seguinos en nuestras redes sociales para estar al tanto de todo lo que tenemos para ofrecerte!</p>
    </body>
  </html>`
}

module.exports = newUser
