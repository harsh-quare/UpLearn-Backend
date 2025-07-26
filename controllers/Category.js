const Category = require("../models/Category");
const Course = require("../models/Course");

// Category creation handler function
exports.createCategory = async (req, res) => {
    try{
        // fetch name and description from req body
        const {name, description} = req.body;

        // validation
        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: "Input fields can't be empty, please try again!",
            })
        }

        // create entry in DB
        const categoryDetails = await Category.create({name: name, description: description});
        console.log(categoryDetails);

        res.status(200).json({
            success: true,
            message: "Category created successfully",
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}


// Get all Categories wala handler function
exports.showAllCategories = async (req, res) => {
    try{
        // find all categories, and ensure only the categories which has both name and description fields as non-empty are returned
        const allCategories = await Category.find({}, {name: true, description: true});
        console.log(allCategories);

        res.status(200).json({
            success: true,
            message: "All categories returned successfully",
            allCategories,
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}


// categoryPageDetails handler
exports.categoryPageDetails = async (req, res) => {
    try{
        // fetch categoryId
        const {categoryId} = req.body;

        // get all courses for specified categoryId
        const selectedCategory = await Category.findById(categoryId)
                                               .populate("courses")
                                               .exec();

        // validation
        if(!selectedCategory){
            return res.status(404).json({
                success: false,
                message: "Data not found",
            });
        }

        // get Courses for different categories
        const differentCategories = await Category.find({_id: {$ne: categoryId}, })
        .populate("courses")
        .exec();

        //Three tasks : 1. Most popular/Best Selling (Top 10) 2. Newest courses, 3. Frequenctly bought together

        // 1. get top selling courses
        const topSellingCourses = await Course.aggregate([
            { $match: { category: categoryId } },
            { $addFields: { enrolledCount: { $size: "$studentsEnrolled" } } },
            { $sort: { enrolledCount: -1 } },
            { $limit: 10}
        ]);

        // 2. get newest courses
        const newestCourses = await Course.find({category: categoryId})
                                         .sort({createdAt: -1})
                                         .limit(10)
                                         .exec();

        // 3. get frequently bought together courses
        // Find all users enrolled in courses of this category
        const enrolledUsers = await Course.find({category: categoryId}).distinct("studentsEnrolled");

        // Find other courses these users are enrolled in (excluding the original category)
        const frequentlyBoughtTogether = await Course.find({
            studentsEnrolled: {$in: enrolledUsers},
            category: {$ne: categoryId}
        })
        .limit(10)
        .exec();

        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
                topSellingCourses,
                newestCourses,
                frequentlyBoughtTogether,
            }
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