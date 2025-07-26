const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

// createRating
exports.createRatingAndReview = async (req, res) => {
    try{
        // fetch data from req body
        const {rating, review, courseId} = req.body;
        // get user id
        const userId = req.user.id;

        // check if user is enrolled or not
        const courseDetails = await Course.findOne({_id: courseId, studentsEnrolled: {$elemMatch: {$eq: userId} }});
        if(!courseDetails){
            return res.status(400).json({
                success: false,
                message: "Student is not enrolled in this course",
            });
        }
        
        // check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne( { user: userId, course: courseId } );
        if(alreadyReviewed){
            return res.status(403).json({
                success: false,
                message: "Course is already reviewed by Student"
            })
        }
        
        // create rating and review
        const ratingReview = await RatingAndReview.create({
            rating, review,
            course: courseId,
            user: userId,
        });

        // update the course with rating and review
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,
                                    { $push: {ratingAndReviews: ratingReview._id}},
                                    {new: true}
        );
        console.log(updatedCourseDetails);

        // return response
        return res.status(200).json({
            success: true,
            message: "Rating and Review Created Succesfully",
            ratingReview,
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Error in creating rating for the course, please try again!",
        })
    }
}


// getAvgRating
exports.getAverageRating = async (req, res) => {
    try{
        // get course id
        const courseId = req.body.courseId;

        // calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating"},
                }
            }
        ]);

        // return rating
        if(result.length() > 0){
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            }) 
        }

        // if no rating/review exists
        return res.status(200).json({
            success: true,
            message: "Average rating is 0, no ratings given till now",
            averageRating: 0,
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching average rating"
        })
    }
}


// get all rating and reviews
exports.getAllRatingsAndReviews = async (req, res) => {
    try{
        const allReviews = await RatingAndReview.find({})
                                        .sort({rating: "desc"})
                                        .populate({
                                            path: "user",  // populate user
                                            select: "firstName lastName email image",  // only take user fields mentioned
                                        })
                                        .populate({
                                            path: "course",
                                            select: "courseName courseDescription",
                                        })
                                        .exec();
        
        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allReviews,  
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}


// get rating and reviews for a perticular course
exports.getCourseRatingAndReviews = async (req, res) => {
    try{
        // fetch course id
        const {courseId} = req.body;

        // get rating and reviews for the course
        const courseReviews = await RatingAndReview.find({ course: courseId })
        .populate({
            path: "user",
            select: "firstName lastName email image"
        })
        .sort({rating: "desc" })
        .exec()

        return res.status(200).json({
            success: true,
            message: "Rating and reviews for the course fetched successfully",
            courseReviews,
        });

    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong, please try again!",
            error: err.message,
        })
    }
}