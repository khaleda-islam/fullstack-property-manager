import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { createRequest, getMyAssignment } from "../../services/api";
import Alert       from "../../components/Alert";
import Toast       from "../../components/Toast";
import PhotoUpload from "../../components/PhotoUpload";

const PRIORITIES = ["Standard", "Urgent", "Emergency"];

const PRIORITY_INFO = {
  Standard:  { badge: "info",    icon: "bi-flag",                       desc: "Non-urgent, routine maintenance"          },
  Urgent:    { badge: "warning", icon: "bi-flag-fill",                  desc: "Needs attention soon, affects daily life" },
  Emergency: { badge: "danger",  icon: "bi-exclamation-triangle-fill",  desc: "Immediate risk to safety or property"     },
};
  

const MAX_PHOTOS = 3;

const toBase64 = (file) =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload  = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

export default function SubmitMaintenance() {
  const { getAccessTokenSilently } = useAuth0();

  const [subject,      setSubject]      = useState("");
  const [description,  setDescription]  = useState("");
  const [priority,     setPriority]     = useState("Standard");
  const [photos,       setPhotos]       = useState([]);
  const [submitting,   setSubmitting]   = useState(false);
  const [alert,        setAlert]        = useState({ type: "", message: "" });
  const [toast,        setToast]        = useState({ show: false, type: "success", message: "" });
  const [hasAssignment,setHasAssignment]= useState(null);

  // ── Check assignment on mount ─────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const token = await getAccessTokenSilently();
        await getMyAssignment(token);
        setHasAssignment(true);
      } catch {
        setHasAssignment(false);
      }
    };
    check();
  }, []);

  // ── Clear form ────────────────────────────────────────────────────────────
  const clearForm = () => {
    setSubject("");
    setDescription("");
    setPriority("Standard");
    setPhotos([]);
    setAlert({ type: "", message: "" });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setAlert({ type: "", message: "" });

    if (!subject.trim()) {
      setAlert({ type: "warning", message: "Please enter a subject." });
      return;
    }
    if (!description.trim()) {
      setAlert({ type: "warning", message: "Please enter a description." });
      return;
    }

    setSubmitting(true);
    try {
      const token = await getAccessTokenSilently();

      // Convert photos to base64 for upload
      const photoBase64s = await Promise.all(photos.map((p) => toBase64(p.file)));

      await createRequest(token, {
        subject:     subject.trim(),
        description: description.trim(),
        priority,
        photos:      photoBase64s,
      });

      clearForm();
      setToast({ show: true, type: "success", message: "Maintenance request submitted successfully!" });
    } catch (err) {
      const msg = err.message?.includes("No active property")
        ? "You are not assigned to a property. Please contact your landlord."
        : "Failed to submit request. Please try again.";
      setAlert({ type: "danger", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPriority = PRIORITY_INFO[priority];

  // ── Loading ────────────────────────────────────────────────────────────────
  if (hasAssignment === null) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner-border text-success" />
      </div>
    );
  }

  // ── No assignment ──────────────────────────────────────────────────────────
  if (!hasAssignment) {
    return (
      <div className="p-4" style={{ maxWidth: 720 }}>
        <div className="mb-4">
          <h4 className="fw-bold mb-1">Submit Maintenance Request</h4>
          <p className="text-muted small mb-0">Describe the issue and we'll get it resolved as soon as possible.</p>
        </div>
        <div className="text-center py-5">
          <i className="bi bi-house-x text-muted fs-1 d-block mb-3" />
          <h5 className="fw-bold text-muted">No Property Assigned</h5>
          <p className="text-muted small">
            You have not been assigned to a property yet.<br />
            Please contact your landlord to get assigned.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" style={{ maxWidth: 720 }}>

      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Submit Maintenance Request</h4>
        <p className="text-muted small mb-0">Describe the issue and we'll get it resolved as soon as possible.</p>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        dismissible
        onDismiss={() => setAlert({ type: "", message: "" })}
      />

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="row g-4">

            {/* Subject */}
            <div className="col-12">
              <label className="form-label fw-semibold">
                Subject <span className="text-danger">*</span>
              </label>
              <input
                className="form-control"
                placeholder="e.g. Heater not working in bedroom"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={100}
                disabled={submitting}
              />
              <div className="text-muted small mt-1">{subject.length}/100</div>
            </div>

            {/* Description */}
            <div className="col-12">
              <label className="form-label fw-semibold">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                rows={5}
                placeholder="Describe the issue in detail. Include when it started, how severe it is, and any relevant information..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                disabled={submitting}
              />
              <div className="text-muted small mt-1">{description.length}/1000</div>
            </div>

            {/* Priority */}
            <div className="col-12">
              <label className="form-label fw-semibold">Priority</label>
              <select
                className="form-select mb-2"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={submitting}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <div className={`alert alert-${selectedPriority.badge} d-flex align-items-center gap-2 py-2 mb-0`}>
                <i className={`bi ${selectedPriority.icon}`} />
                <span className="small">{selectedPriority.desc}</span>
              </div>
            </div>

            {/* Photo upload */}
            <div className="col-12">
              <label className="form-label fw-semibold">
                Photos
                <span className="text-muted fw-normal ms-2 small">(max 3)</span>
              </label>
              <PhotoUpload
                photos={photos}
                onChange={setPhotos}
                maxPhotos={3}
                disabled={submitting}
              />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="card-footer bg-transparent border-top p-4 d-flex justify-content-end gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={clearForm}
            disabled={submitting}
          >
            <i className="bi bi-x-lg me-1" />Clear
          </button>
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
              : <><i className="bi bi-send me-1" />Submit Request</>}
          </button>
        </div>
      </div>

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

    </div>
  );
}
