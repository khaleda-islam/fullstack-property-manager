const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    landlordId: {
      type: String,
      required: [true, "Landlord ID is required"],
      index: true
    },
    name:     { type: String, required: true, trim: true },
    
    location: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    units:    { type: Number, required: true, min: 1 },
    // Cloudinary image
    image: {
      url:       { type: String, default: "" },
      publicId:  { type: String, default: "" }, // needed to delete from Cloudinary
    },


    description: {
      type: String,
      default: "",
      trim: true,
  
    },
   
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Property", propertySchema);