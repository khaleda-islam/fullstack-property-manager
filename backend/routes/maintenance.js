const express = require("express");
const router  = express.Router();
const { checkJwt } = require("../middleware/auth");
const c = require("../controllers/maintenanceController");

// ── Static routes FIRST (before any /:id wildcards) ──────────────────────────
router.post("/",                      checkJwt, c.createRequest);
router.get("/my",                     checkJwt, c.getMyRequests);
router.get("/assigned",               checkJwt, c.getAssignedRequests);
router.get("/my-jobs",                checkJwt, c.getMyJobs);
router.get("/past-jobs",              checkJwt, c.getPastJobs);
router.get("/completed",              checkJwt, c.getLandlordCompletedRequests);
router.get("/contractors",            checkJwt, c.searchContractors);
router.get("/property/:propertyId",   checkJwt, c.getPropertyRequests);

// ── Dynamic /:id routes AFTER ─────────────────────────────────────────────────
router.patch("/:id/status",              checkJwt, c.updateStatus);
router.patch("/:id/contractor-status",   checkJwt, c.contractorUpdateStatus);
router.patch("/:id/assign",              checkJwt, c.assignContractor);
router.patch("/:id/unassign",         checkJwt, c.unassignContractor);
router.patch("/:id/respond",          checkJwt, c.respondToAssignment);
router.delete("/:id",                 checkJwt, c.deleteRequest);

module.exports = router;
