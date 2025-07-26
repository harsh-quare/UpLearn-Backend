const express = require("express");
const router = express.Router();
const { authn } = require("../middlewares/auth");
const {deleteAccount, updateProfile, getAllUserDetails, updateDisplayPicture, getEnrolledCourses} = require("../controllers/Profile");



// Profile routes


// delete user account
router.delete("/deleteProfile", authn, deleteAccount);
// update profile
router.put("/updateProfile", authn, updateProfile);
// get user details
router.get("/getUserDetails", authn, getAllUserDetails);
// get enrolled courses
router.get("/getEnrolledCourses", authn, getEnrolledCourses);
// update display picture
router.put("/updateDisplayPicture", authn, updateDisplayPicture);

module.exports = router;