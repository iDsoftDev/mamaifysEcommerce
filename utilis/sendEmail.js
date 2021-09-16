const nodemailer = require("nodemailer");

const sendEmail = async (options) => {

  var transport = nodemailer.createTransport({
    sendMail: true,
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_LOGIN,
        pass: process.env.EMAIL_PASSWORD
    }
  });
  // Then the transport you initialized
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<h6>You are receiving this email because you (or someone else ) has
    requested the reset of a password.</h6><a href=${options.url}><button>Click Here</button></a>`,
  };
  console.log(message);
  transport.sendMail(message, function (error, info) {
     if (error) {
       console.log(error);
       res.end("error");
     } else {
       console.log("Message sent: " + info);
       res.end("sent"); // This part does NOT get executed.
    };
  });
};
module.exports = sendEmail;