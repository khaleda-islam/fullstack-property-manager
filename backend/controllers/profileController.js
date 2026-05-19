const cloudinary = require("cloudinary").v2;
const Profile    = require("../models/Profile");

// ── GET /api/profile — get current user's profile ─────────────────────────────
const getProfile = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;

    // Find or create profile — new users start with empty profile
    let profile = await Profile.findOne({ auth0Id });
    if (!profile) {
      profile = await Profile.create({ auth0Id });
    }

    res.json(profile);
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// ── PUT /api/profile — update current user's profile ─────────────────────────
const updateProfile = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const {
      firstName, lastName, email,
      contactNumber, address, city, state,
      jobType,
      photoBase64,
    } = req.body;

    let profile = await Profile.findOne({ auth0Id });
    if (!profile) {
      profile = new Profile({ auth0Id });
    }

    // Upload new photo to Cloudinary if provided
    if (photoBase64) {
      // Delete old photo if exists
      if (profile.photo?.publicId) {
        await cloudinary.uploader.destroy(profile.photo.publicId);
      }
      const uploaded = await cloudinary.uploader.upload(photoBase64, {
        folder:         "t6pms/profiles",
        transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
      });
      profile.photo = { url: uploaded.secure_url, publicId: uploaded.public_id };
    }

    // Update fields if provided
    if (firstName      !== undefined) profile.firstName      = firstName;
    if (lastName       !== undefined) profile.lastName       = lastName;
    if (email          !== undefined) profile.email          = email;
    if (contactNumber  !== undefined) profile.contactNumber  = contactNumber;
    if (address        !== undefined) profile.address        = address;
    if (city           !== undefined) profile.city           = city;
    if (state          !== undefined) profile.state          = state;
    if (jobType        !== undefined) profile.jobType        = jobType;

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// ── DELETE /api/profile/photo — remove profile photo ─────────────────────────
const deleteProfilePhoto = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const profile = await Profile.findOne({ auth0Id });

    if (!profile) return res.status(404).json({ error: "Profile not found" });

    if (profile.photo?.publicId) {
      await cloudinary.uploader.destroy(profile.photo.publicId);
    }

    profile.photo = { url: "", publicId: "" };
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error("deleteProfilePhoto error:", err);
    res.status(500).json({ error: "Failed to delete photo" });
  }
};

module.exports = { getProfile, updateProfile, deleteProfilePhoto };
