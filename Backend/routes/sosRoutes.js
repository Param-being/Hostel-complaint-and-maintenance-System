const express = require("express");
const router = express.Router();

// Controllers
const {
  triggerSOS,
  getAllSOS,
  resolveSOS
} = require("../controllers/sosController");

// Middleware
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// ======================
// ROUTES
// ======================

// Student triggers SOS
router.post("/", protect, triggerSOS);

// Admin gets all SOS
router.get("/", protect, authorizeRoles("admin"), getAllSOS);

// Admin resolves SOS
router.put("/:id", protect, authorizeRoles("admin"), resolveSOS);

module.exports = router;