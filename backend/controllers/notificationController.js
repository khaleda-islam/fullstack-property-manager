const Notification = require("../models/Notification");

// ── GET /api/notifications ────────────────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const userId        = req.auth.payload.sub;
    const notifications = await Notification
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// ── PATCH /api/notifications/:id/read ─────────────────────────────────────────
const markRead = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("markRead error:", err);
    res.status(500).json({ error: "Failed to mark as read" });
  }
};

// ── PATCH /api/notifications/read-all ────────────────────────────────────────
const markAllRead = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    await Notification.updateMany({ userId, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    console.error("markAllRead error:", err);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
};

// ── Internal helper — save to DB + push via socket if online ──────────────────
const sendNotification = async ({ userId, type, title, message, data = {} }) => {
  try {
    // 1. Always save to DB first — resident will see it on next load
    const notification = await Notification.create({
      userId, type, title, message, data,
    });
    console.log(`🔔 Notification saved for userId: "${userId}" — "${title}"`);

    // 2. Try to push via socket if resident is online right now
    const { getIO, getOnlineUsers } = require("../socket/socketHandler");
    const io          = getIO();
    const onlineUsers = getOnlineUsers();
    const socketId    = onlineUsers[userId];

    console.log(`📋 Online users:`, Object.keys(onlineUsers));
    console.log(`🔍 Looking for socketId of userId: "${userId}" → found: "${socketId}"`);

    if (io && socketId) {
      io.to(socketId).emit("notification", notification);
      console.log(`📡 Notification pushed to socket "${socketId}"`);
    } else {
      console.log(`📭 Resident offline — notification saved to DB only`);
    }

    return notification;
  } catch (err) {
    console.error("sendNotification error:", err);
  }
};

module.exports = { getNotifications, markRead, markAllRead, sendNotification };
