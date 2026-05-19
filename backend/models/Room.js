const mongoose = require("mongoose");

// A Room represents a DM conversation between exactly 2 users.
// Separating Room from Message makes it easy to:
//   - List all conversations for a user (just query Room)
//   - Add room metadata (unread count, last message, etc.)
//   - Scale independently from message storage

const RoomSchema = new mongoose.Schema(
  {
    // Always sorted array of exactly 2 auth0 user IDs
    // e.g. ["auth0|abc", "auth0|xyz"]
    participants: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length === 2,
        message: "A DM room must have exactly 2 participants",
      },
    },

    // Cached last message for conversation list preview
    lastMessage: {
      text:      { type: String,  default: "" },
      senderId:  { type: String,  default: "" },
      senderName:{ type: String,  default: "" },
      sentAt:    { type: Date,    default: null },
    },

    // Unread counts per participant
    // { "auth0|abc": 3, "auth0|xyz": 0 }
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// Fast lookup: find the room between two specific users
// Index for fast lookup — uniqueness enforced by findOrCreateDM logic
RoomSchema.index({ participants: 1 });

// Find a DM room between two users (order doesn't matter)
RoomSchema.statics.findDMRoom = function (userIdA, userIdB) {
  const sorted = [userIdA, userIdB].sort();
  return this.findOne({ participants: { $all: sorted, $size: 2 } });
};

// Find or create a DM room between two users
RoomSchema.statics.findOrCreateDM = async function (userIdA, userIdB) {
  const sorted = [userIdA, userIdB].sort();
  let room = await this.findOne({ participants: { $all: sorted, $size: 2 } });
  if (!room) {
    room = await this.create({ participants: sorted });
  }
  return room;
};

// Get all rooms for a user (for conversation list)
RoomSchema.statics.findRoomsForUser = function (userId) {
  return this.find({ participants: userId }).sort({ "lastMessage.sentAt": -1 });
};

module.exports = mongoose.model("Room", RoomSchema);
