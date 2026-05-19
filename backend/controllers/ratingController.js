const Rating      = require("../models/Rating");
const Profile     = require("../models/Profile");
const User        = require("../models/User");
const Maintenance = require("../models/Maintenance");

// ── POST /api/ratings — landlord rates a contractor ───────────────────────────
const createRating = async (req, res) => {
  try {
    const landlordId    = req.auth.payload.sub;
    const { contractorId, maintenanceId, rating, comment } = req.body;

    if (rating === undefined || rating < 0 || rating > 10) {
      return res.status(400).json({ error: "Rating must be between 0 and 10" });
    }

    // Check maintenance request exists and belongs to this landlord
    const request = await Maintenance.findById(maintenanceId);
    if (!request)                          return res.status(404).json({ error: "Request not found" });
    if (request.landlordId !== landlordId) return res.status(403).json({ error: "Access denied" });

    // One rating per maintenance request
    const existing = await Rating.findOne({ maintenanceId });
    if (existing) return res.status(400).json({ error: "You have already rated this job" });

    const newRating = await Rating.create({
      contractorId, landlordId, maintenanceId,
      rating, comment,
    });

    // Update contractor's average rating on Profile
    const allRatings = await Rating.find({ contractorId });
    const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    await Profile.findOneAndUpdate(
      { auth0Id: contractorId },
      { averageRating: parseFloat(avg.toFixed(1)), totalRatings: allRatings.length }
    );

    res.status(201).json(newRating);
  } catch (err) {
    console.error("createRating error:", err);
    res.status(500).json({ error: "Failed to submit rating" });
  }
};

// ── GET /api/ratings/:contractorId — get all ratings for a contractor ─────────
const getContractorRatings = async (req, res) => {
  try {
    const ratings = await Rating
      .find({ contractorId: req.params.contractorId })
      .sort({ createdAt: -1 });

    // Enrich with landlord info
    const enriched = await Promise.all(
      ratings.map(async (r) => {
        const landlordUser    = await User.findOne({ auth0Id: r.landlordId });
        const landlordProfile = await Profile.findOne({ auth0Id: r.landlordId });
        return {
          ...r.toObject(),
          landlord: {
            name:  landlordUser?.name          || "",
            email: landlordUser?.email         || "",
            photo: landlordProfile?.photo?.url || landlordUser?.picture || "",
          },
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error("getContractorRatings error:", err);
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
};

// ── GET /api/ratings/check/:maintenanceId — check if landlord already rated ───
const checkRating = async (req, res) => {
  try {
    const landlordId = req.auth.payload.sub;
    const existing   = await Rating.findOne({
      maintenanceId: req.params.maintenanceId,
      landlordId,
    });
    res.json({ rated: !!existing, rating: existing || null });
  } catch (err) {
    console.error("checkRating error:", err);
    res.status(500).json({ error: "Failed to check rating" });
  }
};

module.exports = { createRating, getContractorRatings, checkRating };
