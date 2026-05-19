const Message = require("../models/Message");
const Room    = require("../models/Room");

// GET /api/messages/:roomId
const getMessages = async (req, res) => {
  try {
    const myId   = req.auth.payload.sub;
    const { roomId } = req.params;
    const limit  = parseInt(req.query.limit) || 50;

    const room = await Room.findById(roomId);
    if (!room)                             return res.status(404).json({ error: "Room not found" });
    if (!room.participants.includes(myId)) return res.status(403).json({ error: "Access denied" });

    const messages = await Message
      .find({ roomId: room._id })
      .sort({ createdAt: 1 })
      .limit(limit);

    // Mark messages as read + reset unread count
    await Message.updateMany(
      { roomId: room._id, senderId: { $ne: myId }, read: false },
      { $set: { read: true } }
    );
    await Room.findByIdAndUpdate(roomId, {
      $set: { [`unreadCount.${myId}`]: 0 },
    });

    res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// DELETE /api/messages/:messageId — only sender can delete
const deleteMessage = async (req, res) => {
  try {
    const myId = req.auth.payload.sub;
    const msg  = await Message.findById(req.params.messageId);

    if (!msg)                  return res.status(404).json({ error: "Message not found" });
    if (msg.senderId !== myId) return res.status(403).json({ error: "You can only delete your own messages" });

    // Soft delete — update message text instead of removing
    msg.message = "This message was deleted";
    msg.deleted = true;
    await msg.save();

    res.json(msg);
  } catch (err) {
    console.error("deleteMessage error:", err);
    res.status(500).json({ error: "Failed to delete message" });
  }
};

module.exports = { getMessages, deleteMessage };
