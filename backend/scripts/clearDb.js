/**
 * Clear database script
 * Run: node scripts/clearDb.js
 * 
 * WARNING: This will delete ALL data from the database!
 */

require("dotenv").config();
const mongoose = require("mongoose");
const readline = require("readline");

const clearDatabase = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get confirmation from user
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "⚠️  WARNING: This will delete ALL data. Are you sure? (yes/no): ",
      async (answer) => {
        if (answer.toLowerCase() === "yes") {
          console.log("🗑️  Clearing database...");

          // Drop all collections
          const collections = await mongoose.connection.db.collections();
          for (let collection of collections) {
            await collection.deleteMany({});
            console.log(`   ✅ Cleared ${collection.collectionName}`);
          }

          console.log("🎉 Database cleared successfully!");
        } else {
          console.log("❌ Cancelled. No data was deleted.");
        }

        rl.close();
        process.exit(0);
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

clearDatabase();
