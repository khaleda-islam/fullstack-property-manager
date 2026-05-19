require("dotenv").config();
const express  = require("express");
const http     = require("http");
const mongoose = require("mongoose");
const cors     = require("cors");
const path     = require("path");
const cloudinary = require("cloudinary").v2;

const userRoutes          = require("./routes/users");
const roomRoutes          = require("./routes/rooms");
const messageRoutes       = require("./routes/messages");
const propertyRoutes      = require("./routes/properties");
const profileRoutes       = require("./routes/profile");
const assignmentRoutes    = require("./routes/assignments");
const maintenanceRoutes   = require("./routes/maintenance");
const notificationRoutes  = require("./routes/notifications");
const ratingRoutes        = require("./routes/ratings");
const { initSocket }      = require('./socket/socketHandler');
const { startLeaseReminderJob } = require("./jobs/leaseReminderJob");
const seedDatabase        = require("./config/seed");

const app    = express();
const server = http.createServer(app);

// ─── Cloudinary ───────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" })); // increased for base64 images

// ─── REST Routes ──────────────────────────────────────────────────────────────
app.use("/api/users",         userRoutes);
app.use("/api/rooms",         roomRoutes);
app.use("/api/messages",      messageRoutes);
app.use("/api/properties",    propertyRoutes);
app.use("/api/profile",       profileRoutes);
app.use("/api/assignments",   assignmentRoutes);
app.use("/api/maintenance",   maintenanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ratings",       ratingRoutes);
app.get("/health", (_, res) => res.json({ status: "ok" }));

// ── Serve React frontend static files ────────────────────────────────────────
const clientBuildPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(clientBuildPath));

// ── All non-API routes → serve React index.html (client-side routing) ─────────
app.use((req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// ─── Socket.IO ────────────────────────────────────────────────────────────────
initSocket(server);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    
    // Seed database with sample data if empty
    await seedDatabase();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server on http://localhost:${PORT}`);
      startLeaseReminderJob();        // 9:00 AM — production
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });
