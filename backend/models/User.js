const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema(
  {
    auth0Id: { type: String, required: true, unique: true },
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true, lowercase: true },
    picture: { type: String, default: "" },
    role: {
      type: String,
      enum: ["resident", "landlord", "contractor"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
