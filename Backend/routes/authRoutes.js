const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const User = require("../models/User");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

// Workers list for admin
router.get("/workers", protect, async (req, res) => {
  try {
    const workers = await User.find({ role: "worker" }).select("_id name email");
    res.json({ workers });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch workers" });
  }
});

module.exports = router;