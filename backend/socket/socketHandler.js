const { Server }            = require("socket.io");
const { verifySocketToken } = require("../middleware/auth");
const Message               = require("../models/Message");
const Room                  = require("../models/Room");

const onlineUsers = {};
let   ioInstance  = null;

const getIO          = () => ioInstance;
const getOnlineUsers = () => onlineUsers;

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin:  process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const token   = socket.handshake.auth.token;
      if (!token) return next(new Error("No token"));
      const payload = await verifySocketToken(token);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    onlineUsers[userId] = socket.id;
    console.log(`🔌 ${userId} connected`);

    // ── Join a DM room ──────────────────────────────────────────────────────
    socket.on("open_dm", async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room || !room.participants.includes(userId)) return;
        socket.join(roomId);
      } catch (err) {
        console.error("open_dm error:", err);
      }
    });

    // ── Send DM ─────────────────────────────────────────────────────────────
    socket.on("send_dm", async ({ roomId, message, senderName }) => {
      if (!message?.trim()) return;
      try {
        const room = await Room.findById(roomId);
        if (!room || !room.participants.includes(userId)) return;

        const saved = await Message.create({
          roomId:    room._id,
          senderId:  userId,
          senderName,
          message:   message.trim(),
        });

        const otherId = room.participants.find((p) => p !== userId);

        await Room.findByIdAndUpdate(roomId, {
          $set: {
            "lastMessage.text":       saved.message,
            "lastMessage.senderId":   userId,
            "lastMessage.senderName": senderName,
            "lastMessage.sentAt":     saved.createdAt,
          },
          $inc: { [`unreadCount.${otherId}`]: 1 },
        });

        io.to(roomId).emit("receive_dm", {
          _id:        saved._id,
          roomId:     saved.roomId,
          senderId:   saved.senderId,
          senderName: saved.senderName,
          message:    saved.message,
          createdAt:  saved.createdAt,
          read:       saved.read,
        });

        // Notify other user if online
        const { sendNotification } = require("../controllers/notificationController");
        const receiverSocketId = onlineUsers[otherId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("new_message_notification", {
            from:    senderName,
            roomId,
            preview: saved.message.substring(0, 60),
          });
        }
      } catch (err) {
        console.error("send_dm error:", err);
      }
    });

    // ── Delete DM ───────────────────────────────────────────────────────────
    socket.on("delete_dm", async ({ roomId, messageId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg || msg.senderId !== userId) return;

        msg.message = "This message was deleted";
        msg.deleted = true;
        await msg.save();

        // Broadcast to everyone in the room including sender
        io.to(roomId).emit("message_deleted", { messageId });
      } catch (err) {
        console.error("delete_dm error:", err);
      }
    });
    socket.on("typing", ({ roomId, isTyping, senderName }) => {
      socket.to(roomId).emit("user_typing", { isTyping, senderName });
    });

    // ── Disconnect ──────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      delete onlineUsers[userId];
      console.log(`❌ ${userId} disconnected`);
    });
  });

  return io;
};

module.exports = { initSocket, getIO, getOnlineUsers };
