const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema(
  {
    contractorId:   { type: String, required: true, index: true },
    landlordId:     { type: String, required: true },
    maintenanceId:  { type: mongoose.Schema.Types.ObjectId, ref: "Maintenance", required: true, unique: true },
    rating:         { type: Number, required: true, min: 0, max: 10 },
    comment:        { type: String, default: "", trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rating", RatingSchema);
