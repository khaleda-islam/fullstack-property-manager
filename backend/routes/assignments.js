const express = require("express");
const router  = express.Router();
const { checkJwt } = require("../middleware/auth");
const {
  getAssignments,
  getMyAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateRentStatus,
} = require("../controllers/assignmentController");

// Resident route — must be before /:propertyId to avoid conflict
router.get("/my",                       checkJwt, getMyAssignment);

// Landlord routes
router.get("/:propertyId",              checkJwt, getAssignments);
router.post("/:propertyId",             checkJwt, createAssignment);
router.put("/:assignmentId",            checkJwt, updateAssignment);
router.delete("/:assignmentId",         checkJwt, deleteAssignment);
router.patch("/:assignmentId/rent",     checkJwt, updateRentStatus);

module.exports = router;
