import nodemailer from "nodemailer";
import path from "path";
import dotenv from "dotenv";
import hbs from "nodemailer-express-handlebars";
import { fileURLToPath } from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendEmail = async (
  subject,
  sendTo,
  sendFrom,
  replyTo,
  template,
  name,
  link
) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    name: "smtp.gmail.com",
    host: "smtp.gmail.com",
    port: 465,
    secure: false,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });
  const handlebarsOptions = {
    viewEngine: {
      extName: ".handlebars",
      partialsDir: path.resolve(__dirname, "../views"),
      defaultLayout: false,
    },
    viewPath: path.resolve(__dirname, "../views"), //this means that we are going to read the templates in
    extName: ".handlebars", //this folder with the extension ".handlebars" shortcut
  };

  transporter.use("compile", hbs(handlebarsOptions));

  const mailOptions = {
    from: sendFrom,
    to: sendTo,
    replyTo: replyTo,
    subject: subject,
    template: template,
    context: {
      name: name,
      link: link,
    },
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent : %s", info.messageId);
    return info;
  } catch (error) {
    console.log("Error sending email", error);
    throw error;
  }
};

export default sendEmail;
