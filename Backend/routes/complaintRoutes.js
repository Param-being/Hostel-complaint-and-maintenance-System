const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  assignWorker,
  getWorkerComplaints,
  updateWorkerStatus,
  getDashboardStats
} = require("../controllers/complaintController");

// --- CREATE COMPLAINT ---
router.post("/", protect, upload.single("image"), createComplaint);

// --------------------------------------------------------
// SPECIFIC ROUTES (Hamesha /:id se upar hone chahiye)
// --------------------------------------------------------

// Student: Get own complaints
router.get("/my", protect, getMyComplaints);

// Admin: Get Dashboard Stats
router.get("/stats", protect, authorizeRoles("admin"), getDashboardStats);

// Worker: Get assigned complaints
// ✅ FIX: Changed "/assigned" to "/worker" taaki frontend se match ho jaye
router.get("/worker", protect, authorizeRoles("worker"), getWorkerComplaints);

// Admin: Get ALL complaints
router.get("/", protect, authorizeRoles("admin"), getAllComplaints);


// --------------------------------------------------------
// DYNAMIC ROUTES (/:id wale routes hamesha neeche rakhein)
// --------------------------------------------------------

// Worker: Update task status
router.put("/worker/:id", protect, authorizeRoles("worker"), updateWorkerStatus);

// Admin: Assign worker to complaint
router.put("/assign/:id", protect, authorizeRoles("admin"), assignWorker);

// Admin: Update general complaint status 
// ✅ FIX: Isko sabse neeche kiya hai taaki yeh upar wale /worker/:id ko disturb na kare
router.put("/:id", protect, authorizeRoles("admin"), updateComplaintStatus);

module.exports = router;