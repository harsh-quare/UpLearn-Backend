const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5*60,  // The document will be automatically deleted after 5 minutes of its creation time
    }
});


// A function to send emails, for verifying email
async function sendVerificationEmail(email, otp){ 

    // Create a transporter to send emails

	// Define the email options

	// Send the email
    try{
        const mailResponse = await mailSender(
            email, 
            "Verification mail from UpLearn", 
            emailTemplate(otp)
        );  // {email, title, body}
        console.log("Email sent successfully: ", mailResponse.response);
    }
    catch(err){
        console.log("Error occured while sending mail: ", err);
        throw err;
    }
}

// Define a post-save hook to send email after the document has been saved
otpSchema.pre("save", async function(next) {
    // Only send an email when a new document is created
    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
}); 


module.exports = mongoose.model("OTP", otpSchema);