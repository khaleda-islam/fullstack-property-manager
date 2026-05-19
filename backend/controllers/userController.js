const User = require("../models/User");

// Role-based chat permissions
const ALLOWED_CHAT_WITH = {
  resident:   ["landlord"],
  landlord:   ["resident", "contractor"],
  contractor: ["landlord"],
};

// POST /api/users/sync
const syncUser = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const { name, email, picture, role } = req.body;

    if (!["resident", "landlord", "contractor"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findOneAndUpdate(
      { auth0Id },
      { auth0Id, name, email, picture, role },
      { upsert: true, new: true }
    );

    res.json(user);
  } catch (err) {
    console.error("syncUser error:", err);
    res.status(500).json({ error: "Failed to sync user" });
  }
};

// GET /api/users/me
const getMe = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const user = await User.findOne({ auth0Id });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = { syncUser, getMe}
