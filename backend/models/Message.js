const mongoose = require("mongoose");

// Message now references Room._id (ObjectId) instead of a plain string.
// This is proper relational design and enables efficient indexed queries.

const MessageSchema = new mongoose.Schema(
  {
    // Reference to Room._id — proper ObjectId, not a plain string
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    senderId:   { type: String, required: true },        // auth0 user ID
    senderName: { type: String, required: true, trim: true },
    message:    { type: String, required: true, trim: true, maxlength: 2000 },
    read:       { type: Boolean, default: false },
    deleted:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index: fast room history queries sorted by time
MessageSchema.index({ roomId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", MessageSchema);
