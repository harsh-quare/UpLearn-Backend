const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSectionVideo = require("../models/SubSectionVideo");

exports.createSection = async (req, res) => {
    try{
        // fetch data
        const {sectionName, courseId} = req.body;

        // data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success: false,
                message: "Missing properties, please try again",
            });
        }

        // create section
        const newSection = await Section.create({sectionName});

        // update course with section ObjectID
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                            courseId,
                                            { $push: {courseContent: newSection._id} },
                                            { new: true },
        )
        .populate({
            path: "courseContent",
            populate: {
                path: "subSections"
            }
        })
        .exec();
        
        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            updatedCourseDetails,
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Unable to create section, please try again",
            error: err.message,
        })
    }
}


exports.updateSection = async (req, res) => {
    try{
        // fetch input data
        const {sectionName, sectionId} = req.body;

        // data validation 
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success: false,
                message: "Missing properties, please try again",
            });
        }

        // update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new: true});

        // return response
        return res.status(200).json({
            success: true,
            message: "Section updated successfully",
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Unable to update section, please try again",
            error: err.message,
        })
    }
}


exports.deleteSection = async (req, res) => {
    try{
        // fetch id for deleting section
        const {sectionId} = req.body;

        // id validation
        if(!sectionId){
            return res.status(400).json({
                success: false,
                message: "Error in fetching section, please try again",
            });
        }

        // Find and Delete All SubSections Belonging to the Section: When you delete a Section, you should also delete all SubSections that belong to that Section. Otherwise, those SubSection documents will remain in your database as orphaned data (abandoned, not referenced by any Section).
        const section = await Section.findById(sectionId);
        if(!section){
            return res.status(404).json({
                success: false,
                message: "Section not found",
            });
        }

        // Delete all subsections belonging to this section
        await SubSectionVideo.deleteMany({_id: { $in: section.subSections } });  //Find all documents in the SubSection collection whose _id is in the array section.subSections.
        // $in is a MongoDB operator that matches any value in the specified array.
        // deletes all SubSection documents whose _id matches any value in the section.subSection array.

        // Now delete the section: use findByIdAndDelete
        await Section.findByIdAndDelete(sectionId);

        // delete this section Id from course schema as well
        // it finds all the courses with given sectionId(to be on safer side) and then deletes the sectionID from array of sectionIDs
        await Course.updateMany(
            { courseContent: sectionId },  // This query finds all courses where the courseContent array contains the sectionId.
            { $pull: { courseContent: sectionId } } // The update removes (pulls out) that sectionId from the courseContent array in all matched courses.
        );

        // return response
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully",
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Unable to delete section, please try again",
            error: err.message,
        })
    }
}