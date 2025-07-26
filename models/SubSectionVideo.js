const mongoose = require("mongoose");

const subSectionVideoSchema = new mongoose.Schema({
    
    title: {
        type: String,
    },
    timeDuration: {
        type: String,
    },
    description: {
        type: String,
    },
    videoUrl: {
        type: String,
    },
    videoPublicId: {  // will help in deleting files from cloudinary
        type: String,
    }
});

module.exports = mongoose.model("SubSectionVideo", subSectionVideoSchema);