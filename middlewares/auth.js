const jwt = require("jsonwebtoken");
require("dotenv").config();
// const User = require("../models/User");

// authentication
exports.authn = async (req, res, next) => {
    try{
        // extract token
        const authHeader = req.header("Authorization");  // for checking if the header exists or not, first extract header
        const token = req.cookies.token || req.body.token || (authHeader && authHeader.replace("Bearer ", ""));

        // validation
        if(!token || token === undefined){
            return res.status(401).json({
                success: false,
                message: "No authentication token provided",
            });
        }

        // verify the token
        try{
            const payload = jwt.verify(token, process.env.JWT_SECRET);  // it verifies the jwt using the secret key, and if the token is valid, it decodes the payload(data inside token), and returns the payload
            console.log(payload);

            req.user = payload; // attach the payload to the user object, so that it can be used in authorization
        }
        catch(err){
            console.log(err);
            res.status(401).json({
                success: false,
                message: "Token is invalid, please try again",
            });
        }

        next();

    }
    catch(err){
        console.log(err);
        res.status(401).json({
            success: false,
            message: "Error in user authentication, please login in again"
        })
    }
}

// isStudent
exports.isStudent = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Student"){
            return res.ststus(401).json({
                success: false,
                message: "This is a protected route for Students only, please try again"
            })
        }

        next();
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again",
        })
    }
}

// isInstructor
exports.isInstructor = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Instructor"){
            return res.ststus(401).json({
                success: false,
                message: "This is a protected route for Instructors only, please try again"
            })
        }

        next();
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again",
        })
    }
}

// isAdmin
exports.isAdmin = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Admin"){
            return res.ststus(401).json({
                success: false,
                message: "This is a protected route for Admins only, please try again"
            })
        }
        next();
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again",
        })
    }
}