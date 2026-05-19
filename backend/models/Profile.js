const mongoose = require("mongoose");

// Profile is separate from User so auth fields stay clean.
// Linked to User via auth0Id (one-to-one).

const ProfileSchema = new mongoose.Schema(
  {
    auth0Id:       { type: String, required: true, unique: true, index: true },

    // Basic info
    firstName:     { type: String, default: "", trim: true },
    lastName:      { type: String, default: "", trim: true },
    email:         { type: String, default: "", trim: true, lowercase: true },

    // Contact
    contactNumber: { type: String, default: "", trim: true },

    // Address
    address:       { type: String, default: "", trim: true },
    city:          { type: String, default: "", trim: true },
    state:         { type: String, default: "", trim: true },

    // Photo — stored in Cloudinary
    photo: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    // Contractor only — job type
    jobType: { type: String, default: "", trim: true },

    // Contractor only — average rating (0–10, default 0)
    averageRating: { type: Number, default: 0, min: 0, max: 10 },
    totalRatings:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema);
