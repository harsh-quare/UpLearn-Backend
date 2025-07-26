const Course = require("../models/Course");
const User = require("../models/User");
const {fileUploadCloudinary} = require("../utils/fileUploadCloudinary");
const Category = require("../models/Category");


// createCourse handler function
exports.createCourse = async (req, res) => {
    try{

        // fetch data
        let {courseName, courseDescription, whatYouWillLearn, price, category, tag, status, instructions} = req.body;

        // get thumbnail image file
        const thumbnail = req.files.thumbnailImage;

        // validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail || !tag){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        if(!status || status == undefined){
            status = "Draft";
        }

        const userId = req.user.id;
        const instructorDetails = await User.findById(userId, {accountType: "Instructor"});
        console.log("Instructor details: ", instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success: false,
                message: "Instructor details not found",
            });
        }

        // check given category is valid or not
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success: false,
                message: "Category details not found",
            });
        }

        // upload image to cloudinary
        const thumbnailImage = await fileUploadCloudinary(thumbnail, process.env.FOLDER_NAME);
        console.log(thumbnailImage);

        // create an entry for new course
        const newCourse = await Course.create({
            courseName, 
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag: tag,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions: instructions,
        });

        // add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            { $push: {courses: newCourse._id} },
            {new: true}
        );

        // Add the new course to the categories
        await Category.findByIdAndUpdate(
            {_id: category},   
            { $push: {courses: newCourse._id} },
            { new: true }
        );

        // return response
        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse,
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}


// getAllCourses handler function
exports.getAllCourses = async (req, res) => {
    try{
        const allCourses = await Course.find({}, {courseName: true,
                                                  price: true,
                                                  thumbnail: true,
                                                  instructor: true,
                                                  ratingAndreviews: true,
                                                  studentsEnrolled: true,})
                                                  .populate("instructor")
                                                  .exec();
                                                  // all the fields must be there and populate them with instructor details

        return res.status(200).json({
            success: true,
            message: "Data for all courses fetched successfully",
            data: allCourses,
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Cannot fetch course data",
            error: err.message,
        })
    }
}

// getCourseDetails
exports.getCourseDetails = async (req, res) => {
    try{
        // fetch course id
        const {courseId} = req.body;

        // find course details and populate all the objectId fields
        const courseDetails = await Course.find({_id: courseId})
                                                .populate(
                                                        {
                                                            path: "instructor",
                                                            populate:{
                                                                path: "additionalDetails",
                                                            }
                                                        }
                                                )
                                                .populate("category")
                                                .populate("ratingAndReviews")
                                                .populate({
                                                    path: "courseContent",
                                                    populate: {
                                                        path: "subSections",
                                                    }
                                                })
                                                .exec();

        if(!courseDetails){
            return res.status(400).json({
                success: false,
                message: `Could not find the course with given courseId: ${courseId}`,
            })
        }

        // return response
        return res.status(200).json({
            success: true,
            message: "Course details fetched successfully",
            courseDetails,
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Error in fetching course details, please try again!", 
        })
    }
}