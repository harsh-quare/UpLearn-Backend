const cron = require("node-cron");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Course = require("../models/Course");
const RatingAndReview = require("../models/RatingAndReview");

// run every minute
cron.schedule('* * * * *', async () => {
    const now = new Date();
    const usersToDelete = await User.find({ pendingDelete: true, deleteAt: {$lte: now } });

    for(const user of usersToDelete){
        // Unenroll user from all courses(safety)
        await Course.updateMany(
            {studentsEnrolled: user._id},
            {$pull: {studentsEnrolled: user._id}}
        );

        // Delete ratings and reviews by user
        await RatingAndReview.deleteMany({ user: user._id });

        // delete profile
        await Profile.findByIdAndDelete(user.additionalDetails);

        // delete user
        await User.findByIdAndDelete(user._id);
    }
})