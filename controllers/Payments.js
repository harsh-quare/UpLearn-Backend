const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const mongoose = require("mongoose");


// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {

    // get courseId and UserId
    const {course_id} = req.body;
    const userId = req.user.id;

    // validation
    // valid courseId
    if(!course_id){
        return res.json({
            success: false,
            message: "Please provide valid course ID",
        });
    }
    // valid courseDetail
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course){
            return res.json({
                success:false,
                message: "Could not find the course",
            });
        }

        // user already paid for the same course or not?
        const uid = new mongoose.Types.ObjectId(userId);  // convert user id from string to objectId
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success: true,
                message: "Students is already enrolled",
            });
        }
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }



    // order create
    const amount = course.price;
    const currency = "INR";
    const options = {
        amount: amount*100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        // first 3 are mandatory, below ones are optional
        notes: {
            courseId: course_id,
            userId,
        }
    };
    try{
        // initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        // return response
        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
            message: ""
        });
    }
    catch(err){
        console.log(err);
        res.json({
            success: false,
            message: "Could not initiate order",
        })
    }
}



// Verify signature of Razorpay and server
exports.verifySignature = async (req, res) => {

    const webhookSecret = "12345678";

    const signature = req.headers["x-razorpay-signature"];

    const shasum =  crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    // Now match the signature(which came from razorpay), and the digest(which you created by hashing the secret at server)
    if(signature === digest){
        console.log("Payment is authorised");

        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try{
            // fulfill the action
            // find the course and enroll the student into it
            const enrolledCourse = await Course.findOneAndUpdate(
                                            {_id: courseId},
                                            {$push: {studentsEnrolled: userId}},
                                            {new: true}
            );
            if(!enrolledCourse){
                return res.status(500).json({
                    success: false,
                    message: "Course not found"
                });
            }
            console.log(enrolledCourse);


            // Find the student and add course into list of enrolledCourses
            const enrolledStudent = await User.findOneAndUpdate(
                                            {_id: userId},
                                            {$push: {courses: courseId}},
                                            {new: true},
            );
            if(!enrolledStudent){
                return res.status(500).json({
                    success: false,
                    message: "Student not found"
                });
            }
            console.log(enrolledStudent);


            // confirmation mail send
            const emailresponse = await mailSender(
                enrolledStudent.email,
                "Congratulations from UpLearn",
                "Congratulations, you are onboarder into new UpLearn course", 
            )

            console.log(emailResponse);
            return res.status(200).json({
                success: true,
                message: "Signature verified and course added",
            });
        }
        catch(err){
            console.log(err);
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }
    else{
        // Signature did not match
        return res.status(400).json({
            success: false,
            message: "Invalid request",
        });
    }

}