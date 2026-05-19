const Room = require("../models/Room");
const User = require("../models/User");

// GET /api/rooms
const getRooms = async (req, res) => {
  try {
    const myId = req.auth.payload.sub;

    const rooms = await Room.findRoomsForUser(myId);

    // Deduplicate — keep only one room per other user (oldest)
    const seen    = new Set();
    const unique  = [];
    for (const room of rooms) {
      const otherId = room.participants.find((p) => p !== myId);
      if (!seen.has(otherId)) {
        seen.add(otherId);
        unique.push(room);
      }
    }

    const otherIds   = unique.map((r) => r.participants.find((p) => p !== myId));
    const otherUsers = await User.find(
      { auth0Id: { $in: otherIds } },
      "auth0Id name email picture role"
    );

    const userMap = {};
    otherUsers.forEach((u) => { userMap[u.auth0Id] = u; });

    const result = unique.map((room) => {
      const otherId   = room.participants.find((p) => p !== myId);
      const otherUser = userMap[otherId] || null;
      const unread    = room.unreadCount?.get(myId) || 0;
      return {
        roomId:      room._id,
        otherUser,
        lastMessage: room.lastMessage,
        unread,
        updatedAt:   room.updatedAt,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("getRooms error:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

// POST /api/rooms — find or create a DM room (always returns same room for same pair)
const findOrCreateRoom = async (req, res) => {
  try {
    const myId = req.auth.payload.sub;
    const { otherUserId } = req.body;

    if (!otherUserId)       return res.status(400).json({ error: "otherUserId required" });
    if (myId === otherUserId) return res.status(400).json({ error: "Cannot DM yourself" });

    // Always sorted so the same pair always maps to the same room
    const sorted = [myId, otherUserId].sort();

    // Check for duplicates and clean up — keep only the oldest room
    const existing = await Room.find({
      participants: { $all: sorted, $size: 2 },
    }).sort({ createdAt: 1 });

    if (existing.length > 1) {
      // Keep the first (oldest), delete the rest
      const keepId   = existing[0]._id;
      const deleteIds = existing.slice(1).map((r) => r._id);
      await Room.deleteMany({ _id: { $in: deleteIds } });
      return res.json(existing[0]);
    }

    const room = await Room.findOrCreateDM(myId, otherUserId);
    res.json(room);
  } catch (err) {
    console.error("findOrCreateRoom error:", err);
    res.status(500).json({ error: "Failed to create room" });
  }
};

// GET /api/rooms/:roomId
const getRoomById = async (req, res) => {
  try {
    const myId = req.auth.payload.sub;
    const room = await Room.findById(req.params.roomId);

    if (!room) return res.status(404).json({ error: "Room not found" });

    if (!room.participants.includes(myId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(room);
  } catch (err) {
    console.error("getRoomById error:", err);
    res.status(500).json({ error: "Failed to fetch room" });
  }
};

module.exports = { getRooms, findOrCreateRoom, getRoomById };
