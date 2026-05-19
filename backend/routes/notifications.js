const express = require("express");
const router  = express.Router();
const { checkJwt } = require("../middleware/auth");
const c = require("../controllers/notificationController");

router.get("/",              checkJwt, c.getNotifications);
router.patch("/read-all",    checkJwt, c.markAllRead);
router.patch("/:id/read",    checkJwt, c.markRead);

module.exports = router;
