const cloudinary = require("cloudinary").v2;

// ── Cloudinary is configured in server.js on startup ─────────────────────────
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key:    process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// ── Upload image (profile photos, property photos, maintenance photos) ────────
const uploadImage = async (base64, folder, options = {}) => {
  const result = await cloudinary.uploader.upload(base64, {
    folder,
    resource_type: "image",
    ...options,
  });
  return {
    url:      result.secure_url,
    publicId: result.public_id,
  };
};

// ── Upload PDF (lease documents) ──────────────────────────────────────────────
const uploadPDF = async (base64, folder, fileName, options = {}) => {
  const result = await cloudinary.uploader.upload(base64, {
    folder,
    resource_type: "raw",
    flags:         "attachment",
    public_id:     fileName,
    ...options,
  });
  return {
    url:      result.secure_url,
    publicId: result.public_id,
    fileName: fileName || "document.pdf",
  };
};

// ── Delete file by publicId ───────────────────────────────────────────────────
const deleteFile = async (publicId, resourceType = "image") => {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

// ── Delete PDF by publicId ────────────────────────────────────────────────────
const deletePDF = async (publicId) => {
  await deleteFile(publicId, "raw");
};

// ── Get file info by publicId ─────────────────────────────────────────────────
const getFileInfo = async (publicId, resourceType = "image") => {
  const result = await cloudinary.api.resource(publicId, { resource_type: resourceType });
  return {
    url:       result.secure_url,
    publicId:  result.public_id,
    format:    result.format,
    bytes:     result.bytes,
    createdAt: result.created_at,
  };
};

// ── Upload profile photo (auto crop to face) ──────────────────────────────────
const uploadProfilePhoto = async (base64) => {
  return uploadImage(base64, "t6pms/profiles", {
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  });
};

// ── Upload property photo ─────────────────────────────────────────────────────
const uploadPropertyPhoto = async (base64) => {
  return uploadImage(base64, "t6pms/properties");
};

// ── Upload lease document PDF ─────────────────────────────────────────────────
const uploadLeaseDocument = async (base64, propertyId, residentId, fileName) => {
  const safeId = `lease_${propertyId}_${residentId}`.replace(/\|/g, "_");
  return uploadPDF(base64, "t6pms/leases", safeId, {
    display_name: fileName || "lease_agreement.pdf",
  });
};

// ── Upload maintenance photo ──────────────────────────────────────────────────
const uploadMaintenancePhoto = async (base64) => {
  return uploadImage(base64, "t6pms/maintenance");
};

// ── Upload contractor document (certifications, licenses) ────────────────────
const uploadContractorDocument = async (base64, contractorId, fileName) => {
  const safeId = `contractor_${contractorId}`.replace(/\|/g, "_");
  return uploadPDF(base64, "t6pms/contractors", safeId, {
    display_name: fileName || "contractor_document.pdf",
  });
};

module.exports = {
  uploadImage,
  uploadPDF,
  deleteFile,
  deletePDF,
  getFileInfo,
  uploadProfilePhoto,
  uploadPropertyPhoto,
  uploadLeaseDocument,
  uploadMaintenancePhoto,
  uploadContractorDocument,
};
