const express = require("express");
const router = express.Router();

const { capturePayment , verifySignature} = require("../controllers/Payments");
const { authn, isInstructor, isStudent, isAdmin } = require("../middlewares/auth");


// Payments routes


// capture payment
router.post("/capturePayment", authn, isStudent, capturePayment);
// verify Signature
router.post("/verifySignature", verifySignature);

module.exports = router;