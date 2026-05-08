const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http"); // ✅ 1. Import HTTP module
const { Server } = require("socket.io"); // ✅ 2. Import Socket.IO

// Load env variables
dotenv.config();

// Import DB
const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const sosRoutes = require("./routes/sosRoutes");

// Import Middleware
const protect = require("./middleware/authMiddleware");
const authorizeRoles = require("./middleware/roleMiddleware");

// Connect Database
connectDB();

const app = express();

// ✅ 3. Wrap Express app in an HTTP Server
const server = http.createServer(app);

// =======================
// MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());

// =======================
// SOCKET.IO SETUP 🚨
// =======================
// ✅ 4. Initialize Socket.io with CORS allowed for React frontend
const io = new Server(server, {
  
  cors: {
    origin: "*", // Adjust this to your React app's URL in production (e.g., "http://localhost:3000")
    methods: ["GET", "POST"],
  },
});
app.set("io", io);
// ✅ 5. Listen for Socket Connections
io.on("connection", (socket) => {
  console.log(`🔌 A user connected: ${socket.id}`);

  // Listen for 'trigger-sos' from the Student Frontend
  socket.on("trigger-sos", (data) => {
    console.log("🚨 SOS TRIGGERED BY:", data.user?.name);
    
    // Broadcast the 'sos-alert' to EVERYONE else (Admin Dashboard will listen for this)
    socket.broadcast.emit("sos-alert", {
      message: "EMERGENCY SOS TRIGGERED!",
      user: data.user,
      time: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// =======================
// ROUTES
// =======================

// Auth routes
app.use("/api/auth", authRoutes);

// Complaint routes
app.use("/api/complaints", complaintRoutes);

// SOS routes
app.use("/api/sos", sosRoutes);

// =======================
// TEST ROUTES
// =======================
app.get("/", (req, res) => {
  res.send("🚀 HostelCare API with Socket.IO is running...");
});

// =======================
// SERVER START
// =======================
const PORT = process.env.PORT || 5000;

// ✅ 6. Use server.listen INSTEAD of app.listen
server.listen(PORT, () => {
  console.log(`🔥 Server & Socket.IO running on port ${PORT}`);
});