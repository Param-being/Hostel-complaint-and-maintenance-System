const SOS = require("../models/SOS");

// Trigger SOS
exports.triggerSOS = async (req, res) => {
  try {
    const sos = await SOS.create({
      user: req.user.id,
      message: "Emergency Alert"
    });

    res.status(201).json({
      success: true,
      message: "SOS triggered successfully",
      sos
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all SOS (Admin)
exports.getAllSOS = async (req, res) => {
  try {
    const sosList = await SOS.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      sosList
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Resolve SOS
exports.resolveSOS = async (req, res) => {
  try {
    const sos = await SOS.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "SOS resolved",
      sos
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};