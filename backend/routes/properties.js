const express = require("express");
const router  = express.Router();
const { checkJwt } = require("../middleware/auth");
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");

router.get("/",     checkJwt, getProperties);
router.get("/:id",  checkJwt, getPropertyById);
router.post("/",    checkJwt, createProperty);
router.put("/:id",  checkJwt, updateProperty);
router.delete("/:id", checkJwt, deleteProperty);

module.exports = router;
