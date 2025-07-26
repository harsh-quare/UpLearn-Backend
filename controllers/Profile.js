const Course = require("../models/Course");
const Profile = require("../models/Profile");
const User = require("../models/User");
const {fileUploadCloudinary} = require("../utils/fileUploadCloudinary");


exports.updateProfile = async (req, res) => {
    try{
        // fetch data
        const {dateOfBirth="", about="", contactNumber, gender} = req.body; 

        // fetch userId
        const userId = req.user.id;

        // validate
        if(!contactNumber || !gender || !userId){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        //find the already created profile object
        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // update profile fields
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.contactNumber = contactNumber;
        profileDetails.about = about;
        profileDetails.gender = gender;
        await profileDetails.save();  // save the updated object into DB

        // return response
        return res.status(200).json({
            success: true,
            message: "Profile Updated successfully",
            profileDetails,
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Error in updating profile, please try again!",
            error: err.message,
        })
    }
}

// delete account
exports.deleteAccount = async (req, res) => {
    try{
        // get id
        const userId = req.user.id;
        
        // validate id
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Unenroll user from all courses
        await Course.updateMany(
            { studentsEnrolled: userId },
            { $pull: { studentsEnrolled: userId } }
        );

        // Delete associated profile with the user and Mark the user as pending deletion
        const profileId = user.additionalDetails;
        await User.findByIdAndUpdate(userId, {
            pendingDelete: true,
            deleteAt: new Date(Date.now() + 5*24*60*60*1000)  // 5 days later
        });

        // delete the profile(additionalDetails) of the user, if want to delete now
        await Profile.findByIdAndDelete(profileId);

        // return response
        return res.status(200).json({
            success: true,
            message: "Account scheduled for deletion in 5 days.",
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Error in deleting account, please try again",
            error: err.message,
        })
    }
}

// Update display picture
exports.updateDisplayPicture = async (req, res) => {
    try{
        // fetch picture and user id
        const displayPicture = req.files.displayPicture;
        if (!displayPicture || !displayPicture.tempFilePath) {
            return res.status(400).json({
                success: false,
                message: "No picture file uploaded.",
            });
        }
        console.log(displayPicture);

        const userId = req.user.id;
        console.log(userId);

        // upload to cloudinary
        const image = await fileUploadCloudinary(displayPicture, process.env.FOLDER_NAME, 1000, 1000);
        console.log(image);

        const updatedProfile = await User.findByIdAndUpdate(userId, {image: image.secure_url}, {new: true});

        res.send({
            success: true,
            message: "Image updated successfully",
            data: updatedProfile,
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Error in updating profile picture, please try again after some time",
        })
    }
}

exports.getAllUserDetails = async (req, res) => {
    try{
        // get id
        const userId = req.user.id;

        // validation and get user details
        const userDetails = await User.findById(userId).populate("additionalDetails").exec();

        // return response
        return res.status(200).json({
            success: true,
            message: "User data fetched successfully",
            userDetails,
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Error in fetching User data",
            error: err.message,
        })
    }
}

// get enrolled courses of a user
exports.getEnrolledCourses = async (req, res) => {
    try{
        const userId = req.user.id;

        const userDetails = await User.findOne({_id: userId}).populate("courses").exec();
        if(!userDetails){
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userId}`,
            });
        }

        return res.status(200).json({
            success: true,
            data: userDetails.courses,
        });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}