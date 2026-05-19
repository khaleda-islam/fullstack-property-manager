const cloudinary  = require("cloudinary").v2;
const Maintenance = require("../models/Maintenance");
const Assignment  = require("../models/Assignment");
const User        = require("../models/User");
const Profile     = require("../models/Profile");

// ── POST /api/maintenance — resident submits a request ───────────────────────
const createRequest = async (req, res) => {
  try {
    const residentId = req.auth.payload.sub;
    const { subject, description, priority, photos } = req.body;

    if (!subject?.trim())     return res.status(400).json({ error: "Subject is required" });
    if (!description?.trim()) return res.status(400).json({ error: "Description is required" });

    // Find resident's active assignment to get propertyId + landlordId
    const assignment = await Assignment.findOne({ residentId, status: "active" });
    if (!assignment) {
      return res.status(404).json({ error: "No active property assignment found. Contact your landlord." });
    }

    // Upload photos to Cloudinary (max 3)
    const uploadedPhotos = [];
    if (photos && photos.length > 0) {
      const toUpload = photos.slice(0, 3);
      for (const base64 of toUpload) {
        const uploaded = await cloudinary.uploader.upload(base64, {
          folder: "t6pms/maintenance",
        });
        uploadedPhotos.push({ url: uploaded.secure_url, publicId: uploaded.public_id });
      }
    }

    const request = await Maintenance.create({
      residentId,
      propertyId:  assignment.propertyId,
      landlordId:  assignment.landlordId,
      subject:     subject.trim(),
      description: description.trim(),
      priority:    priority || "Standard",
      photos:      uploadedPhotos,
    });

    res.status(201).json(request);
  } catch (err) {
    console.error("createRequest error:", err);
    res.status(500).json({ error: "Failed to submit request" });
  }
};

// ── GET /api/maintenance/my — resident gets their own requests ────────────────
const getMyRequests = async (req, res) => {
  try {
    const residentId = req.auth.payload.sub;
    const requests   = await Maintenance
      .find({ residentId })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error("getMyRequests error:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

// ── GET /api/maintenance/property/:propertyId — landlord gets all requests ────
const getPropertyRequests = async (req, res) => {
  try {
    const landlordId = req.auth.payload.sub;
    const requests   = await Maintenance
      .find({ propertyId: req.params.propertyId, landlordId })
      .sort({ createdAt: -1 });

    // Enrich with resident email + profile photo
    const enriched = await Promise.all(
      requests.map(async (r) => {
        const user    = await User.findOne({ auth0Id: r.residentId });
        const profile = await Profile.findOne({ auth0Id: r.residentId });

        // Get property location
        const Property = require("../models/Property");
        const property = await Property.findById(r.propertyId);

        // Get contractor info if assigned
        let contractorInfo = null;
        if (r.contractorId) {
          const contractorUser    = await User.findOne({ auth0Id: r.contractorId });
          const contractorProfile = await Profile.findOne({ auth0Id: r.contractorId });
          contractorInfo = {
            auth0Id:  r.contractorId,
            email:    contractorUser?.email           || "",
            photo:    contractorProfile?.photo?.url   || contractorUser?.picture || "",
            firstName:contractorProfile?.firstName    || "",
            lastName: contractorProfile?.lastName     || "",
            jobType:  contractorProfile?.jobType      || "",
          };
        }

        return {
          ...r.toObject(),
          residentEmail:    user?.email           || "",
          residentPhoto:    profile?.photo?.url   || user?.picture || "",
          propertyLocation: property?.location    || "",
          contractor:       contractorInfo,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error("getPropertyRequests error:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

// ── PATCH /api/maintenance/:id/status — landlord updates status ───────────────
const updateStatus = async (req, res) => {
  try {
    const landlordId = req.auth.payload.sub;
    const { status } = req.body;

    if (!["Submitted", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const request = await Maintenance.findById(req.params.id);
    if (!request)                       return res.status(404).json({ error: "Request not found" });
    if (request.landlordId !== landlordId) return res.status(403).json({ error: "Access denied" });

    request.status = status;
    await request.save();

    // Send real-time notification to resident
    const { sendNotification } = require("./notificationController");
    await sendNotification({
      userId:  request.residentId,
      type:    "maintenance_status",
      title:   "Maintenance Request Updated",
      message: `Your request "${request.subject}" status changed to "${status}".`,
      data:    { requestId: request._id, status, subject: request.subject },
    });

    res.json(request);
  } catch (err) {
    console.error("updateStatus error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

// ── DELETE /api/maintenance/:id — resident deletes their own request ──────────
const deleteRequest = async (req, res) => {
  try {
    const residentId = req.auth.payload.sub;
    const request    = await Maintenance.findById(req.params.id);

    if (!request)                        return res.status(404).json({ error: "Request not found" });
    if (request.residentId !== residentId) return res.status(403).json({ error: "Access denied" });

    // Delete photos from Cloudinary
    for (const photo of request.photos) {
      if (photo.publicId) {
        await cloudinary.uploader.destroy(photo.publicId);
      }
    }

    await Maintenance.findByIdAndDelete(req.params.id);
    res.json({ message: "Request deleted successfully" });
  } catch (err) {
    console.error("deleteRequest error:", err);
    res.status(500).json({ error: "Failed to delete request" });
  }
};

// ── GET /api/maintenance/past-jobs — contractor gets their completed jobs ──────
const getPastJobs = async (req, res) => {
  try {
    const contractorId = req.auth.payload.sub;

    const requests = await Maintenance
      .find({ contractorId, assignmentStatus: "Accepted", status: "Completed" })
      .sort({ updatedAt: -1 });

    const enriched = await Promise.all(
      requests.map(async (r) => {
        const landlordUser    = await User.findOne({ auth0Id: r.landlordId });
        const landlordProfile = await Profile.findOne({ auth0Id: r.landlordId });
        const Property        = require("../models/Property");
        const property        = await Property.findById(r.propertyId);

        return {
          ...r.toObject(),
          propertyLocation: property?.location || "",
          landlord: {
            name:  landlordUser?.name            || "",
            email: landlordUser?.email           || "",
            photo: landlordProfile?.photo?.url   || landlordUser?.picture || "",
          },
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error("getPastJobs error:", err);
    res.status(500).json({ error: "Failed to fetch past jobs" });
  }
};

// ── GET /api/maintenance/my-jobs — contractor gets their accepted jobs ────────
const getMyJobs = async (req, res) => {
  try {
    const contractorId = req.auth.payload.sub;

    const requests = await Maintenance
      .find({ contractorId, assignmentStatus: "Accepted", status: { $ne: "Completed" } })
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(
      requests.map(async (r) => {
        const landlordUser    = await User.findOne({ auth0Id: r.landlordId });
        const landlordProfile = await Profile.findOne({ auth0Id: r.landlordId });
        const Property        = require("../models/Property");
        const property        = await Property.findById(r.propertyId);

        return {
          ...r.toObject(),
          propertyLocation: property?.location || "",
          landlord: {
            name:  landlordUser?.name              || "",
            email: landlordUser?.email             || "",
            photo: landlordProfile?.photo?.url     || landlordUser?.picture || "",
          },
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error("getMyJobs error:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

// ── PATCH /api/maintenance/:id/contractor-status — contractor updates job status
const contractorUpdateStatus = async (req, res) => {
  try {
    const contractorId = req.auth.payload.sub;
    const { status }   = req.body;

    if (!["In Progress", "Completed"].includes(status)) {
      return res.status(400).json({ error: "Contractor can only set In Progress or Completed" });
    }

    const request = await Maintenance.findById(req.params.id);
    if (!request)                              return res.status(404).json({ error: "Request not found" });
    if (request.contractorId !== contractorId) return res.status(403).json({ error: "Access denied" });

    request.status = status;
    await request.save();

    const { sendNotification } = require("./notificationController");

    // Notify resident
    await sendNotification({
      userId:  request.residentId,
      type:    "maintenance_status",
      title:   "Maintenance Request Updated",
      message: `Your request "${request.subject}" has been updated to "${status}" by the contractor.`,
      data:    { requestId: request._id, status, subject: request.subject },
    });

    // Notify landlord
    await sendNotification({
      userId:  request.landlordId,
      type:    "maintenance_status",
      title:   "Job Status Updated",
      message: `Contractor updated "${request.subject}" to "${status}".`,
      data:    { requestId: request._id, status, subject: request.subject },
    });

    res.json(request);
  } catch (err) {
    console.error("contractorUpdateStatus error:", err);
    res.status(500).json({ error: "Failed to update job status" });
  }
};

// ── GET /api/maintenance/assigned — contractor gets their pending requests ─────
const getAssignedRequests = async (req, res) => {
  try {
    const contractorId = req.auth.payload.sub;

    const requests = await Maintenance
      .find({ contractorId, assignmentStatus: "Pending" })
      .sort({ createdAt: -1 });

    // Enrich with landlord info + property location
    const enriched = await Promise.all(
      requests.map(async (r) => {
        const landlordUser    = await User.findOne({ auth0Id: r.landlordId });
        const landlordProfile = await Profile.findOne({ auth0Id: r.landlordId });
        const Property        = require("../models/Property");
        const property        = await Property.findById(r.propertyId);

        return {
          ...r.toObject(),
          propertyLocation: property?.location || "",
          landlord: {
            name:  landlordUser?.name              || "",
            email: landlordUser?.email             || "",
            photo: landlordProfile?.photo?.url     || landlordUser?.picture || "",
          },
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error("getAssignedRequests error:", err);
    res.status(500).json({ error: "Failed to fetch assigned requests" });
  }
};

// ── GET /api/maintenance/completed — landlord gets all completed requests ──────
const getLandlordCompletedRequests = async (req, res) => {
  try {
    const landlordId = req.auth.payload.sub;

    const requests = await Maintenance
      .find({ landlordId, status: "Completed" })
      .sort({ updatedAt: -1 });

    const enriched = await Promise.all(
      requests.map(async (r) => {
        const residentUser    = await User.findOne({ auth0Id: r.residentId });
        const residentProfile = await Profile.findOne({ auth0Id: r.residentId });
        const Property        = require("../models/Property");
        const property        = await Property.findById(r.propertyId);

        let contractor = null;
        if (r.contractorId) {
          const contractorUser    = await User.findOne({ auth0Id: r.contractorId });
          const contractorProfile = await Profile.findOne({ auth0Id: r.contractorId });
          contractor = {
            firstName: contractorProfile?.firstName  || "",
            lastName:  contractorProfile?.lastName   || "",
            email:     contractorUser?.email         || "",
            photo:     contractorProfile?.photo?.url || contractorUser?.picture || "",
            jobType:   contractorProfile?.jobType    || "",
          };
        }

        return {
          ...r.toObject(),
          residentEmail:    residentUser?.email           || "",
          residentPhoto:    residentProfile?.photo?.url   || residentUser?.picture || "",
          propertyLocation: property?.location            || "",
          contractor,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error("getLandlordCompletedRequests error:", err);
    res.status(500).json({ error: "Failed to fetch completed requests" });
  }
};

const searchContractors = async (req, res) => {
  try {
    const { jobType, city, minRating, maxRating } = req.query;

    // Find all contractor users
    const User = require("../models/User");
    const contractorUsers = await User.find({ role: "contractor" });
    const contractorIds   = contractorUsers.map((u) => u.auth0Id);

    // Find their profiles
    let query = { auth0Id: { $in: contractorIds } };
    if (jobType) query.jobType = jobType;
    if (city)    query.city    = { $regex: city, $options: "i" };

    let profiles = await Profile.find(query);

    // Filter by rating range
    if (minRating !== undefined || maxRating !== undefined) {
      const min = parseFloat(minRating ?? 0);
      const max = parseFloat(maxRating ?? 10);
      profiles = profiles.filter((p) => p.averageRating >= min && p.averageRating <= max);
    }

    // Enrich with user email
    const enriched = profiles.map((p) => {
      const user = contractorUsers.find((u) => u.auth0Id === p.auth0Id);
      return {
        auth0Id:       p.auth0Id,
        firstName:     p.firstName,
        lastName:      p.lastName,
        email:         user?.email || "",
        profileEmail:  p.email     || "",
        photo:         p.photo?.url || "",
        city:          p.city,
        state:         p.state,
        jobType:       p.jobType,
        averageRating: p.averageRating,
        totalRatings:  p.totalRatings,
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error("searchContractors error:", err);
    res.status(500).json({ error: "Failed to search contractors" });
  }
};

// ── PATCH /api/maintenance/:id/assign — landlord assigns contractor ────────────
const assignContractor = async (req, res) => {
  try {
    const landlordId   = req.auth.payload.sub;
    const { contractorId } = req.body;

    if (!contractorId) return res.status(400).json({ error: "contractorId is required" });

    const request = await Maintenance.findById(req.params.id);
    if (!request)                          return res.status(404).json({ error: "Request not found" });
    if (request.landlordId !== landlordId) return res.status(403).json({ error: "Access denied" });

    request.contractorId     = contractorId;
    request.assignmentStatus = "Pending";
    await request.save();

    // Notify contractor
    const { sendNotification } = require("./notificationController");
    await sendNotification({
      userId:  contractorId,
      type:    "contractor_assigned",
      title:   "New Job Request",
      message: `You have been assigned to a maintenance request: "${request.subject}". Please accept or decline.`,
      data:    { requestId: request._id, subject: request.subject },
    });

    res.json(request);
  } catch (err) {
    console.error("assignContractor error:", err);
    res.status(500).json({ error: "Failed to assign contractor" });
  }
};

// ── PATCH /api/maintenance/:id/respond — contractor accepts or declines ────────
const respondToAssignment = async (req, res) => {
  try {
    const contractorId = req.auth.payload.sub;
    const { response  } = req.body; // "Accepted" | "Declined"

    if (!["Accepted", "Declined"].includes(response)) {
      return res.status(400).json({ error: "Response must be Accepted or Declined" });
    }

    const request = await Maintenance.findById(req.params.id);
    if (!request)                             return res.status(404).json({ error: "Request not found" });
    if (request.contractorId !== contractorId) return res.status(403).json({ error: "Access denied" });

    request.assignmentStatus = response;
    await request.save();

    // Notify landlord
    const { sendNotification } = require("./notificationController");
    await sendNotification({
      userId:  request.landlordId,
      type:    "contractor_response",
      title:   `Contractor ${response} Job`,
      message: `A contractor has ${response.toLowerCase()} the request: "${request.subject}".`,
      data:    { requestId: request._id, subject: request.subject, response },
    });

    res.json(request);
  } catch (err) {
    console.error("respondToAssignment error:", err);
    res.status(500).json({ error: "Failed to respond to assignment" });
  }
};

// ── PATCH /api/maintenance/:id/unassign — landlord removes contractor ─────────
const unassignContractor = async (req, res) => {
  try {
    const landlordId = req.auth.payload.sub;
    const request    = await Maintenance.findById(req.params.id);

    if (!request)                          return res.status(404).json({ error: "Request not found" });
    if (request.landlordId !== landlordId) return res.status(403).json({ error: "Access denied" });

    request.contractorId     = "";
    request.assignmentStatus = "Unassigned";
    await request.save();

    res.json(request);
  } catch (err) {
    console.error("unassignContractor error:", err);
    res.status(500).json({ error: "Failed to unassign contractor" });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getMyJobs,
  getPastJobs,
  getAssignedRequests,
  getLandlordCompletedRequests,
  getPropertyRequests,
  updateStatus,
  contractorUpdateStatus,
  deleteRequest,
  searchContractors,
  assignContractor,
  unassignContractor,
  respondToAssignment,
};
