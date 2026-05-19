const mongoose = require("mongoose");

// Assignment links a resident to a property with lease details.
// One resident can only be assigned to one property at a time.

const AssignmentSchema = new mongoose.Schema(
  {
    propertyId:  { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    landlordId:  { type: String, required: true },   // auth0Id of landlord
    residentId:  { type: String, required: true },   // auth0Id of resident

    // Lease info
    leaseExpireDate: { type: Date, required: true },

    // Lease document — stored in Cloudinary
    leaseDocument: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
      fileName: { type: String, default: "" },
    },

    // Status
    status: {
      type:    String,
      enum:    ["active", "expired", "terminated"],
      default: "active",
    },

    // Rent payment status — manually managed by landlord
    rentPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// A resident can only be assigned t6o one property at a time
AssignmentSchema.index({ residentId: 1 }, { unique: true });

module.exports = mongoose.model("Assignment", AssignmentSchema);
