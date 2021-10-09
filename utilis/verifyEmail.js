
const nodemailer = require("nodemailer");

const verifyEmail = async (options) => {

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
var mailOptions = {
  from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
  to: options.email,
  subject: options.subject,
  html:
    "<div style =" +
    "width:100%; height:100%;  " +
    "><h2 style=" +
    "font-weight:500>Hi, " +
    options.name +
    "<br>Welcome to MamaIfy's Online Shopping</h2><h4>Thanks for Signing up on our app</h4><h3>Your Code for verification is : " +
    options.code +
    " </h3></div><p>If this request is not made by you kindly ignore this mail.</p><p>Regards, <strong>Idam Eni Uzoma(Owner)</strong></p>",
 };
console.log(mailOptions);
transport.sendMail(mailOptions, function (error, info) {
   if (error) {
     console.log(error);
     res.end("error");
   } else {
     console.log("Message sent: " + info);
     res.end("sent"); // This part does NOT get executed.
  }; 
});

};
module.exports = {verifyEmail};
