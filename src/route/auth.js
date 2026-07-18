const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const router = express.Router();
const authController = require("../controller/auth.controller");
router.post("/register", authController.register);
router.post("/verifyEmail", authController.verifyEmail);
router.post("/login", authController.login);

// adminRoute 

router.post("/create-admin", verifyToken, isAdmin, authController.createAdmin);

// logout functionality

router.post("/logout", authController.logout);

// refresh token functionality

router.post("/refresh-token", authController.refreshAccessToken);
router.get("/me", verifyToken, authController.getProfile);

module.exports = router;