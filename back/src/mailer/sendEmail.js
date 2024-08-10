const transporter = require("../mailer/mailer");
const { NODEMAILER_USER } = process.env;

const sendEmail = (to, subject, html) => {
  console.log("Enviando Email...");
  let emailOptions = {
    from: NODEMAILER_USER,
    to,
    subject,
    html:
      html ||
      `<h1>Email testing</h1> <p>Este es un email de prueba enviado a <b>${to}</b> usando la librería Nodemailer.</p> <p>No olvides visitar nuestra webs para encontrar las mejores recetas de cocina, con los ingredientes que tengas en tu alacena.</p><a href="https://mangiare.vercel.app/">MANGIARE</a>`,
  };

  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      console.log("Email error: ", error.message);
    } else {
      console.log("Email enviado satisfactoriamente 📧");
    }
  });
};

module.exports = sendEmail;
