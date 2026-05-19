const express = require("express");
const router  = express.Router();
const { checkJwt } = require("../middleware/auth");
const { getMessages, deleteMessage } = require("../controllers/messageController");

router.get("/:roomId",          checkJwt, getMessages);
router.delete("/:messageId",    checkJwt, deleteMessage);

module.exports = router;
