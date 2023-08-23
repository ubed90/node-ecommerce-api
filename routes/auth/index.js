// * Imports
const express = require("express");
const { register, login, logout } = require("../../controllers/authController");

// * Variables
const router = express.Router();


// * Route Declarations
router.post("/login", login);
router.post("/register", register);
router.get("/logout", logout);

module.exports = router;
