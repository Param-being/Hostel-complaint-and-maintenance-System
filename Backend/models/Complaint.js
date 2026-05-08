const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "resolved"],
    default: "pending"
  },
  category: {
    type: String,
    enum: ["Plumbing", "Electrical", "Cleaning", "Carpentry", "Other"],
    default: "Other"
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  image: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Complaint", complaintSchema);