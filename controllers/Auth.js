const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mailSender = require("../utils/mailSender");
const Profile = require("../models/Profile");
const { passwordUpdate } = require("../mail/templates/passwordUpdate");



// sign Up controller for registering users
exports.signUp = async (req, res) => {
    try{
        // fetch data from req body
        const {firstName, lastName, email, password,
            confirmPassword, accountType, contactNumber, otp} = req.body;

        // validate the data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success: false,
                message: "Please fill all the details mentioned",
            })
        }

        // match both passwords entered
        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Both password values do not match, please try again",
            });
        }

        // check if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.json(400).json({
                success: false,
                message: "User is already registered, please login",
            });
        }

        // find most recent OTP stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);  //Sorts by createdAt field in descending order (-1 means newest first). Limits the result to 1 document(the most recent OTP).

        // validate the OTP
        if(recentOtp.length === 0) {
            // otp not found
            return res.status(400).json({
                success: false,
                message: "OTP not found"
            })
        }
        else if(otp !== recentOtp[0].otp){
            // invalid otp
            return res.status(400).json({
                success: false,
                messsage: "Invalid OTP, please try again!",
            })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        let approved = "";
        approved === "Instructor" ? (approved = false) : (approved = true);

        // create entry in DB
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
        });
        const createdUser = await User.create({
            firstName, 
            lastName, 
            email, 
            password: hashedPassword, 
            accountType, 
            contactNumber,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        // return response success
        return res.status(200).json({
            success: true,
            message: "User registered succcessfully",
            createdUser,
        });
    }
    catch(err){
        console.log("Error in signing up", err);
        res.status(500).json({
            success: false,
            message: "User cannot be registered, please try again",
        })
    }
}



// login
exports.login = async (req, res) => {
    try{
        // fetch data from req body
        const {email, password} = req.body;

        // validate the data
        if(!email || !password){
            return res.status(403).json({
                success: false,
                message: "Input fields cannot be empty, please try again!",
            });
        }

        // check if user exists or not
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success: false,
                message: "Email not registered, Please sign up first",
            });
        }

        // Match passwords
        if(await bcrypt.compare(password, user.password)){
            // Passwords matched
            // Generate a JWT token
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            let jwtToken = jwt.sign(payload,
                                process.env.JWT_SECRET,
                                {
                                    expiresIn: "24h",
                                }
            );

            // Save token to user document in database
            user.toObject();
            user.token = jwtToken;

            // hide password from user object
            user.password = undefined;

            // create cookie for token and send success response
            const options = {
                expiresIn: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true,
            }
            res.cookie("token", jwtToken, options).status(200).json({
                success: true,
                user,
                jwtToken,
                message: "User logged in successfully"
            });
        }
        else{
            return res.status(401).json({
                success: false,
                message: "Password is incorrect, please try again",
            })
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Error in login, please try again",
        })
    }
}



// send OTP for email verification
exports.sendOTP = async (req, res) => {
    try{

        // fetch email from req body
        const {email} = req.body;

        // check if a user already exist with given email or not
        const userAlreadyExists = await User.findOne({email});
        if(userAlreadyExists){
            return res.status(401).json({
                status: false,
                message: "Email already registered, Please try logging in!"
            });
        }

        // if no user exists with given email, then generate an OTP
        var otp = otpGenerator.generate(6, {  // generate function takes 2 params, 1st is length of the OTP, 2nd is the options object
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });
        const result = await OTP.findOne({otp: otp});
        console.log("OTP generated: ", otp);
        console.log("Result", result);

        // ensure OTP is unique
        while(result){
            otp = otpGenerator.generate(6, {               
                upperCaseAlphabets: false,
            });
        }

        // Unique OTP found, Create an entry of email and its OTP in the DB
        const savedOTPBody = await OTP.create({email, otp});
        console.log(savedOTPBody);

        res.status(200).json({
            success: true,
            message: "OTP sent successfully to the email, Please enter OTP.",
            otp,
        });

    }
    catch(err){
        console.log("Error in sending OTP: ", err);
        res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
}



// change password
exports.changePassword = async (req, res) => {
    try{
        // get user data from req.user
        const userDetails = await User.findById(req.user.id);
        // get data from req body => {oldPass, newPass, confirmNewPass}
        const {oldPassword, newPassword, confirmNewPassword} = req.body;

        // validation
        if(!oldPassword || !newPassword || !confirmNewPassword){
            return res.status(401).json({
                success: false,
                message: "Please fill all the details"
            });
        }

        if(newPassword !== confirmNewPassword){
            return res.status(400).json({
                success: false,
                message: "Passwords do not match, please try again"
            });
        }

        if(newPassword === oldPassword){
            return res.status(400).json({
                success: false,
                message: "New password and old password can't be same, Please try a different password",
            });
        }

        // verify old password
        const isMatch = await bcrypt.compare(oldPassword, userDetails.password);
        if(!isMatch){
            return res.status(401).json({
                success: false,
                message: "The password is incorrect",
            });
        }

        // Hash new Password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Upadte pwd in DB
        // method-1
        // userDetails.password = hashedNewPassword;
        // await userDetails.save(); // save the changes
        // method-2
        const updatedUserDetails = await User.findByIdAndUpdate(req.user.id, {password: hashedNewPassword}, {new: true});

        // send notification email => pwd updated
        try{
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdate(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} 
        catch (error) {
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

        // return response
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })

    }
    catch(err){
        console.log("Error occured while updating password: ", err);
        res.status(500).json({
            success: false,
            message: "Error in updating password, please try again",
            error: err.message,
        })
    }
}