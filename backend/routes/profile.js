const express = require("express");
const router  = express.Router();
const { checkJwt } = require("../middleware/auth");
const { getProfile, updateProfile, deleteProfilePhoto } = require("../controllers/profileController");

router.get("/",           checkJwt, getProfile);
router.put("/",           checkJwt, updateProfile);
router.patch("/",         checkJwt, updateProfile);   // partial update (same handler)
router.delete("/photo",   checkJwt, deleteProfilePhoto);

module.exports = router;
