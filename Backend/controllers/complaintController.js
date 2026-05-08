const Complaint = require("../models/Complaint");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// CREATE COMPLAINT WITH IMAGE
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body; // 👈 category add kiya

    let imageUrl = "";

    if (req.file) {
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "complaints" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload(req);
      imageUrl = result.secure_url;
    }

    const complaint = await Complaint.create({
      user: req.user.id,
      title,
      description,
      category: category || "Other", // 👈 category save karo
      image: imageUrl
    });

    res.status(201).json({ message: "Complaint created", complaint });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get My Complaints (Student)
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id });
    return res.status(200).json({ complaints });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Admin: Get All Complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "name email")
      .populate("assignedTo", "name email");
    return res.status(200).json({ complaints });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Admin: Update Status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    return res.status(200).json({ message: "Status updated", complaint });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Admin: Assign Worker
exports.assignWorker = async (req, res) => {
  try {
    const { workerId } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTo: workerId, status: "in-progress" },
      { new: true }
    ).populate("assignedTo", "name email");
    return res.status(200).json({ message: "Worker assigned", complaint });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 🔥 Worker: Get Assigned Complaints (with filter)
exports.getWorkerComplaints = async (req, res) => {
  try {
    const { status, category } = req.query; // 👈 filters lenge

    const filter = { assignedTo: req.user.id };
    if (status) filter.status = status;       // 👈 status filter
    if (category) filter.category = category; // 👈 category filter

    const complaints = await Complaint.find(filter);
    return res.status(200).json({ complaints });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 🔥 Worker: Update Status
exports.updateWorkerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findOneAndUpdate(
      { _id: req.params.id, assignedTo: req.user.id },
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found or not assigned to you" });
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("task-notification", {
        title: "Task Update 🔧",
        message: `A complaint status was changed to: ${status}`
      });
    }

    return res.status(200).json({ message: "Status updated by worker", complaint });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Admin: Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: "pending" });
    const inProgress = await Complaint.countDocuments({ status: "in-progress" });
    const resolved = await Complaint.countDocuments({ status: "resolved" });
    return res.status(200).json({ total, pending, inProgress, resolved });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};