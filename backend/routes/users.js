const express = require("express");
const router  = express.Router();
const { checkJwt } = require("../middleware/auth");
const { syncUser, getMe} = require("../controllers/userController");

router.post("/sync",       checkJwt, syncUser);
router.get("/me",          checkJwt, getMe);

module.exports = router;
