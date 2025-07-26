// what we are doing here is, user enters an email, and we send a link of fontend page to his email
// that link takes to a page, which asks for further details, such new password, confirm new password, and then creating new entry into DB



const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");


// resetPasswordToken => (It will help in sending mail with frontend page link(containing token) for password reset)
exports.resetPasswordToken = async (req, res) => {
    try{
        // fetch email from req body
        const email = req.body.email;
        
        // validate email and verify if registered or not
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success: false,
                message: "No user exists with given email, please try again!"
            });
        }

        // generate a token
        const token = crypto.randomBytes(20).toString("hex");

        // update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
                                                        {email: email},
                                                        {
                                                            token: token,
                                                            resetPasswordExpires: Date.now() + 5*60*1000,
                                                        },
                                                        {new: true});
        console.log("Details: ", updatedDetails);

        // create url
        const url = `http://localhost:3000/update-password/${token}`;  // this is a frontend link, we run frontend on port 3000 and backend on port 4000

        // send mail containing the url
        await mailSender(email, "Password reset", `Your Link for email verification is ${url}. Please click this url to reset your password.`);
        
        //return response
        return res.json({
            success: true,
            message: "Email sent successfully, Please check email and change password"
        })

    }
    catch(err){
        console.log(err);
        res.json({
            success: false,
            message: "Something went wrong, while sending reset password mail"
        })
    }
}

// resetpassword => (It will help in updating the password with new password in DB) 
exports.resetPassword = async (req, res) => {
    try{
        // fetch data
        const {password, confirmPassword, token} = req.body;

        // validation
        if(password !== confirmPassword){
            return res.json({
                success: false,
                message: "Password not matching, please try again!",
            });
        }

        // get user details from DB using token
        const userDetails = await User.findOne({token: token});

        // if no entry => invalid token
        if(!userDetails){
            return res.json({
                success: false,
                message: "Token is invalid",
            });
        }

        // check token expirationTime
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success: false,
                message: "Token to reset password is expired, please generate a new URL",
            });
        }

        // hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // update password in DB
        await User.findOneAndUpdate(
                {token: token},
                {password: hashedPassword},
                {new: true}
        );

        // return response
        return res.json({
            success: true,
            message: "Password reset successfully"
        })

    }
    catch(err){
        console.log(err);
        res.json({
            successs: false,
            message: "Something went wrong, Please try again!",
        })
    }
}