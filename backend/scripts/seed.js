/**
 * Standalone seed script
 * Run: node scripts/seed.js
 * 
 * This will populate the database with sample data for testing
 */

require("dotenv").config();
const mongoose = require("mongoose");
const seedDatabase = require("../config/seed");

const runSeed = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await seedDatabase();

    console.log("🎉 Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

runSeed();
