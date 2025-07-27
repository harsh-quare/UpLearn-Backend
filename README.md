# UpLearn Backend

## Overview

UpLearn is an EdTech platform backend built with Node.js, Express.js, and MongoDB.  
It provides RESTful APIs for user authentication, course management, payments, profile management, ratings, reviews, and more.  
Media files are managed using Cloudinary, and course content supports Markdown formatting for flexible rendering.

---

## Features

- **User Authentication & Authorization:**  
  - Sign up and login for students and instructors  
  - JWT-based authentication  
  - OTP verification  
  - Password reset and change

- **Course Management:**  
  - Instructors can create, update, and delete courses  
  - Section and SubSection management  
  - Students can view, enroll, and rate courses

- **Payment Integration:**  
  - Razorpay integration for secure payments  
  - Course enrollment after successful payment

- **Profile Management:**  
  - Update profile details and display picture  
  - Scheduled account deletion with soft delete and background cleanup

- **Ratings & Reviews:**  
  - Students can rate and review courses  
  - Instructors can view feedback

- **Cloud-based Media Management:**  
  - Cloudinary integration for images, videos, and documents

- **Markdown Formatting:**  
  - Course content supports Markdown for easy display

---

## Tech Stack

- **Node.js** – JavaScript runtime
- **Express.js** – Web application framework
- **MongoDB** – NoSQL database
- **Mongoose** – ODM for MongoDB
- **JWT** – Authentication and authorization
- **Bcrypt** – Password hashing
- **Cloudinary** – Media storage
- **Razorpay** – Payment gateway

---

## Project Structure

```
server/
├── config/
│   ├── cloudinary.js
│   ├── database.js
│   ├── razorpay.js
├── controllers/
│   ├── Auth.js
│   ├── Profile.js
│   ├── Course.js
│   ├── Section.js
│   ├── SubSection.js
│   ├── RatingAndReview.js
│   ├── Category.js
│   ├── ResetPassword.js
│   ├── Payments.js
├── mail/
│   └── templates/
│       ├── courseEnrollmentEmail.js
│       └── emailVerificationTemplate.js
│       ├── passwordUpdate.js
├── middlewares/
│   ├── auth.js
├── models/
│   ├── User.js
│   ├── OTP.js
│   ├── Profile.js
│   ├── Course.js
│   ├── Section.js
│   ├── SubSectionVideo.js
│   ├── RatingAndReview.js
│   ├── Category.js
│   └── CourseProgress.js
├── routes/
│   ├── User.js
│   ├── Course.js
│   ├── Profile.js
│   ├── Payments.js
├── utils/
│   ├── deleteScheduler.js
│   ├── fileUploadCloudinary.js
│   └── mailSender.js
├── .env
├── .gitignore
├── index.js
├── package.json
└── README.md
```

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your_username/uplearn-backend.git
   cd uplearn-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```plaintext
   PORT=4000
   MONGODB_URL=your_mongodb_url
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FOLDER_NAME=your_folder_name
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

---

## Database

The database for the platform is built using MongoDB, a NoSQL database that provides a flexible and scalable data storage solution. MongoDB allows for the storage of unstructured and semi-structured data. The database stores the course content, user data, and other relevant information related to the platform.

<img width="736" height="384" alt="schema" src="https://github.com/user-attachments/assets/f1525c3b-e8a8-45a8-a033-7e2026bd5eee" />


## API Design

UpLearn follows RESTful API principles, using JSON for data exchange and standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).  
Below are sample endpoints (see `routes/` for full details):

### **User Authentication & Profile**
- `POST /api/v1/user/signup` – Register a new user
- `POST /api/v1/user/login` – Login and receive JWT token
- `POST /api/v1/user/sendotp` – Send OTP to email
- `POST /api/v1/user/changepassword` – Change password
- `POST /api/v1/user/reset-password-token` – Generate reset password token
- `POST /api/v1/user/reset-password` – Reset password
- `GET /api/v1/profile/:id` – Get user profile
- `PUT /api/v1/profile/update` – Update profile
- `POST /api/v1/profile/display-picture` – Update display picture
- `DELETE /api/v1/profile/delete-account` – Schedule account deletion

### **Course Management**
- `GET /api/v1/course/:id` – Get course details
- `POST /api/v1/course` – Create a new course
- `PUT /api/v1/course/:id` – Update course
- `DELETE /api/v1/course/:id` – Delete course
- `POST /api/v1/course/enroll` – Enroll in a course

### **Sections & SubSections**
- `POST /api/v1/section` – Create section
- `PUT /api/v1/section/:id` – Update section
- `DELETE /api/v1/section/:id` – Delete section
- `POST /api/v1/subsection` – Create subsection
- `PUT /api/v1/subsection/:id` – Update subsection
- `DELETE /api/v1/subsection/:id` – Delete subsection

### **Ratings & Reviews**
- `POST /api/v1/rating-review` – Add rating and review
- `GET /api/v1/rating-review/:courseId` – Get ratings and reviews for a course

### **Categories**
- `GET /api/v1/category/:id` – Get category details
- `POST /api/v1/category/details` – Get category page details

### **Payments**
- `POST /api/v1/payment/checkout` – Initiate payment
- `POST /api/v1/payment/verify` – Verify payment

---

## Sample API Requests

- **Get all courses:**  
  `GET /api/v1/course`
- **Get a single course:**  
  `GET /api/v1/course/:id`
- **Create a new course:**  
  `POST /api/v1/course`
- **Update a course:**  
  `PUT /api/v1/course/:id`
- **Delete a course:**  
  `DELETE /api/v1/course/:id`

---

## Scheduled Account Deletion

When a user requests account deletion, their account is marked for deletion and scheduled for removal after a delay (e.g., 5 days).  
A background job (`utils/deleteScheduler.js`) periodically checks for users whose deletion time has passed and removes their data from the database.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the MIT License.
