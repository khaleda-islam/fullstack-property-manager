const express = require("express");
const router  = express.Router();
const { checkJwt } = require("../middleware/auth");
const c = require("../controllers/ratingController");

router.post("/",                        checkJwt, c.createRating);
router.get("/check/:maintenanceId",     checkJwt, c.checkRating);
router.get("/:contractorId",            checkJwt, c.getContractorRatings);

module.exports = router;
