const express = require("express");
const router = express.Router();


// Import the controllers

// 1. Course controllers
const {createCourse, getAllCourses, getCourseDetails} = require("../controllers/Course");

// 2. Categories controllers
const {showAllCategories, createCategory, categoryPageDetails} = require("../controllers/Category");

// 3. Sections controllers
const {createSection, updateSection, deleteSection} = require("../controllers/Section");

// 4. Sub-sections controllers
const {createSubSection, updateSubSection, deleteSubSection} = require("../controllers/SubSection");

// 5. rating controllers
const {createRatingAndReview, getAverageRating, getAllRatingsAndReviews, getCourseRatingAndReviews} = require("../controllers/RatingAndReview");
const { authn, isStudent, isInstructor, isAdmin } = require("../middlewares/auth");



//***********************************************
// Course routes
//***********************************************

// Courses can only be created by instructors
router.post("/createCourse", authn, isInstructor, createCourse);

// Add a section to a course
router.post("/addSection", authn, isInstructor, createSection);

// Update a section
router.post("/updateSection", authn, isInstructor, updateSection);

// Delete a section
router.post("/deleteSection", authn, isInstructor, deleteSection);

// Add a subSection to a section
router.post("/addSubSection", authn, isInstructor, createSubSection);

// Update a subSection
router.post("/updateSubSection", authn, isInstructor, updateSubSection);

// Delete a subSection
router.post("/deleteSubSection", authn, isInstructor, deleteSubSection);

// get all registered courses
router.get("/getAllCourses", getAllCourses);

// get all details for a specific course
router.get("/getCourseDetails", getCourseDetails);



// *********************************************
// Category routes (Only by Admin)
// *********************************************

// Catrgory can only be created by Admin
router.post("/createCategory", authn, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);



// ********************************************
// Rating and review routes
// ********************************************

router.post("/createRating", authn, isStudent, createRatingAndReview);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRatingsAndReviews);

module.exports = router;