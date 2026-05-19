require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  FRONTEND_URL: process.env.FRONTEND_URL
};