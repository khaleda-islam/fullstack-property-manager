const express = require("express");
const router  = express.Router();
const { checkJwt } = require("../middleware/auth");
const { getRooms, findOrCreateRoom, getRoomById } = require("../controllers/roomController");

router.get("/",          checkJwt, getRooms);
router.post("/",         checkJwt, findOrCreateRoom);
router.get("/:roomId",   checkJwt, getRoomById);

module.exports = router;
