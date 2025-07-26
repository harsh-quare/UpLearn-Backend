const nodemailer = require("nodemailer");
require("dotenv").config();

// Setup for sending an email
const mailSender = async (email, title, body) => {
    try{
        // create a transporter, apply sendMail method on that transporter to send mails
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        let info = transporter.sendMail({
            from: "UpLearn || A modern education platform - by Harsh",
            to: `${email}`,  
            // fetch email, subject, and mail content from req body
            subject: `${title}`,
            html: `${body}`,
        });

        console.log(info);
        return info;
    }
    catch(err){
        console.log(err.message);
    }
}

module.exports = mailSender;