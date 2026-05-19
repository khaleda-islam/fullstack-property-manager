const cloudinary = require("cloudinary").v2;
const Property   = require("../models/Property");


// POST /api/properties
// Landlord adds a new property
const createProperty = async (req, res) => {
  try {
    const landlordId = req.auth.payload.sub; // from auth middleware
    const { name, location,address, units, description, imageBase64 } = req.body;

   if (!name || !location || !units)
      return res.status(400).json({ error: "name, location and units are required" });
    let image = { url: "", publicId: "" };
    if (imageBase64) {
      const uploaded = await cloudinary.uploader.upload(imageBase64, {
        folder: "t6pms/properties",
      });
      image = { url: uploaded.secure_url, publicId: uploaded.public_id };
    }

    const property = await Property.create({
      landlordId,
      name,
      location,
      units: Number(units),
      description,
      image,
    });

    res.status(201).json(property);
  } catch (error) {
    console.error("createProperty error:", error);
    return res.status(500).json({ error: "Failed to create property" });
  }
};

// GET /api/properties 
// Landlord views all their properties
const getProperties = async (req, res) => {
  try {
    const landlordId = req.auth.payload.sub;

    const properties = await Property.find({ landlordId }).sort({ createdAt: -1 });
    res.json(properties);
    
  } catch (error) {
    console.error("getLandlordProperties error:", error);
    return res.status(500).json({ message: "Failed to fetch properties", error: error.message });
  }
};

//GET /api/properties/:id
// Landlord or Resident views a specific property
const getPropertyById = async (req, res) => {
  try {
   const landlordId = req.auth.payload.sub;
   const property   = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (property.landlordId !== landlordId)
      return res.status(403).json({ error: "Access denied" });

    res.json(property);
  } catch (err) {
    console.error("getPropertyById error:", err);
    res.status(500).json({ error: "Failed to fetch property" });
  }
};

const updateProperty = async (req, res) => {
  try {
    const landlordId = req.auth.payload.sub;
    const property   = await Property.findById(req.params.id);

    if (!property)
      return res.status(404).json({ error: "Property not found" });
    if (property.landlordId !== landlordId)
      return res.status(403).json({ error: "Access denied" });

    const { name, location, units, description, imageBase64 } = req.body;

    // Upload new image to Cloudinary if a new one is provided
    if (imageBase64) {
      // Delete old image from Cloudinary if exists
      if (property.image?.publicId) {
        await cloudinary.uploader.destroy(property.image.publicId);
      }
      const uploaded = await cloudinary.uploader.upload(imageBase64, {
        folder: "t6pms/properties",
      });
      property.image = { url: uploaded.secure_url, publicId: uploaded.public_id };
    }

    if (name)        property.name        = name;
    if (location)    property.location    = location;
    if (units)       property.units       = Number(units);
    if (description !== undefined) property.description = description;

    await property.save();
    res.json(property);
  } catch (err) {
    console.error("updateProperty error:", err);
    res.status(500).json({ error: "Failed to update property" });
  }
};
//DELETE /api/properties/:id
// Landlord deletes a property
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.auth.payload.sub;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (property.landlordId !== landlordId)
      return res.status(403).json({ error: "Access denied" });

    // Delete image from Cloudinary
    if (property.image?.publicId) {
      await cloudinary.uploader.destroy(property.image.publicId);
    }
    // If a resident is assigned, clear their assignedProperty reference
    if (property.residentId) {
      await findByIdAndUpdate(property.residentId, {
        $unset: { "profileDetails.assignedProperty": "" },
      });
    }

    await Property.findByIdAndDelete(req.params.id);;

    return res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("deleteProperty error:", error);
    return res.status(500).json({ error: "Server error", error: error.message });
  }
};




module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  deleteProperty,
  updateProperty,
  
};