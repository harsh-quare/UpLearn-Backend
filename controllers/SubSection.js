const SubSectionVideo = require("../models/SubSectionVideo");
const Section = require("../models/Section");
const {fileUploadCloudinary} = require("../utils/fileUploadCloudinary");
const cloudinary = require("cloudinary").v2;

exports.createSubSection = async (req, res) => {
    try{
        // fetch data from req body
        const {title, timeDuration, description, sectionId} = req.body;

        // extract file/video
        const video = req.files.videoFile;

        // validation
        if(!title || !timeDuration || !description || !sectionId || !video){
            return res.status(400).json({
                success: false,
                message: "All fields are required, please try again",
            });
        }

        // upload video to cloudinary and fetch secure_url
        const uploadDetails = await fileUploadCloudinary(video, process.env.FOLDER_NAME);

        // create a subSection
        const subSectionDetails = await SubSectionVideo.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url,
            videoPublicId: uploadDetails.public_id,
        });

        // update section with this subsection ObjectID
        const updatedSection = await Section.findByIdAndUpdate(sectionId,
                    {$push: {subSections: subSectionDetails._id}},
                    {new: true}
        )
        .populate("subSections")
        .exec();

        console.log("Updated Section:", updatedSection);

        // return response
        return res.status(200).json({
            success: true,
            message: "Sub-Section created successfully",
            updatedSection,
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Unable to create Sub-Section, please try again",
            error: err.message,
        })
    }
}


// update subSection
exports.updateSubSection = async (req, res) => {
    try{
        // fetch data
        const {title, timeDuration, description, subSectionId} = req.body;
        const newVideoFile = req.files.videoFile;

        // data validation
        if(!subSectionId){
            return res.status(400).json({
                success: false,
                message: "SubSection ID required",
            });
        }

        // fetch existing subsection
        const subSection = await SubSectionVideo.findById(subSectionId);
        if(!subSection){
            return res.status(404).json({
                success: false,
                message: "SubSection Not Found!"
            });
        }

        // handling video update
        let videoUrl = subSection.videoUrl;
        let videoPublicId = subSection.videoPublicId;
        if(newVideoFile){
            // delete old video from cloudinary
            if(videoPublicId){
                await cloudinary.uploader.destroy(videoPublicId, { resource_type: "video" });
            }

            // upload new video
            const uploadResult = await fileUploadCloudinary(newVideoFile, process.env.FOLDER_NAME);
            videoUrl = uploadResult.secure_url;
            videoPublicId = uploadResult.public_id;
        }
        
        // prepare update data
        const updateData = {};
        if(title) updateData.title = title;
        if(description) updateData.description = description;
        if(timeDuration) updateData.timeDuration = timeDuration;
        if(newVideoFile){
            updateData.videoUrl = videoUrl;
            updateData.videoPublicId = videoPublicId;
        }

        // update subSection
        const updatedSubSection = await SubSectionVideo.findByIdAndUpdate(subSectionId, updateData, { new: true });

        // return response
        return res.status(200).json({
            success: true,
            message: "SubSection Updated Successfully",
            subSection: updatedSubSection,
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Unable to update the Sub-Section, please try again",
            error: err.message,
        })
    }
}


// delete subSection handler
exports.deleteSubSection = async (req, res) => {
    try{
        // fetch the subSection Id
        const {subSectionId} = req.body;

        // validate
        if(!subSectionId){
            return res.status(400).json({
                success: false,
                message: "SubSection ID required"
            })
        }

        // find the subSection with given id
        const subSection = await SubSectionVideo.findById(subSectionId);
        if(!subSection){
            return res.status(404).json({
                success: false,
                message: "No SubSection found with given ID, please try again",
            });
        }

        // Delete video from Cloudinary if exists
        if(subSection.videoPublicId){
            await cloudinary.uploader.destroy(subSection.videoPublicId, {resource_type: "video"});
        }

        // Delete the subSection from DB
        await SubSectionVideo.findByIdAndDelete(subSectionId);

        // Remove this subSectionId from all Section documents
        await Section.updateMany(
            {subSections: subSectionId},
            {$pull: {subSections: subSectionId}}
        );

        // return response
        return res.status(200).json({
            success: true,
            message: "Sub-Section Deleted Successfully",
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Unable to delete the Sub-Section, please try again",
            error: err.message,
        })
    }
}