const mongoose = require("mongoose");

const MaintenanceSchema = new mongoose.Schema(
  {
    // Who submitted
    residentId:  { type: String, required: true, index: true },

    // Which property + landlord (from assignment)
    propertyId:  { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    landlordId:  { type: String, required: true },

    // Request details
    subject:     { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },

    priority: {
      type:    String,
      enum:    ["Standard", "Urgent", "Emergency"],
      default: "Standard",
    },

    status: {
      type:    String,
      enum:    ["Submitted", "In Progress", "Completed"],
      default: "Submitted",
    },

    // Up to 3 photos — stored in Cloudinary
    photos: [
      {
        url:      { type: String, default: "" },
        publicId: { type: String, default: "" },
      },
    ],

    // Contractor assignment status — tracks contractor relationship only
    assignmentStatus: {
      type:    String,
      enum:    ["Unassigned", "Pending", "Accepted", "Declined"],
      default: "Unassigned",
    },

    // Contractor — linked when assigned
    contractorId: { type: String, default: "" },
  },
  { timestamps: true }
);

// Indexes for common queries
MaintenanceSchema.index({ residentId: 1, createdAt: -1 });
MaintenanceSchema.index({ landlordId: 1, createdAt: -1 });
MaintenanceSchema.index({ propertyId: 1, createdAt: -1 });

module.exports = mongoose.model("Maintenance", MaintenanceSchema);
