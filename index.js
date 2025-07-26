const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");

require("./utils/deleteScheduler");

const database = require("./config/database");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileupload = require("express-fileupload");

const cookieParser = require("cookie-parser");
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 4000;

// connect database
database.dbConnect();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:3000",  
        credentials: true,
    })
);

app.use(fileupload({
    useTempFiles: true,
    tempFileDir: '/tmp',
}));

// cloudinary connection
cloudinaryConnect();

// routes mounting
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);

// default route
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Your server is up and running..."
    });
});

// activate the server
app.listen(PORT, () => {
    console.log(`App started successfully on port ${PORT}`);
});