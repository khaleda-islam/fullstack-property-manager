// ── Usage ─────────────────────────────────────────────────────────────────────
// <JobUpdateStatusModal
//   job={updateJob}
//   saving={saving}
//   error={error}
//   onSave={(id, status) => {}}
//   onClose={() => {}}
// />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

const DEFAULT_AVATAR = "https://placehold.co/36x36/cccccc/ffffff?text=?";

// Contractors can only set In Progress or Completed — not Submitted
const STATUS_OPTIONS = [
  { value: "In Progress", badge: "warning",  icon: "bi-arrow-repeat" },
  { value: "Completed",   badge: "success",  icon: "bi-check-circle" },
];

export default function JobUpdateStatusModal({
  job     = null,
  saving  = false,
  error   = "",
  onSave  = () => {},
  onClose = () => {},
}) {
  const [status, setStatus] = useState("In Progress");

  useEffect(() => {
    if (job) {
      // Default to current status if it's a valid option, else In Progress
      const valid = STATUS_OPTIONS.find((s) => s.value === job.status);
      setStatus(valid ? job.status : "In Progress");
    }
  }, [job]);

  if (!job) return null;

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
        <div className="modal-content border-0 shadow">

          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-pencil me-2 text-warning" />Update Job Status
            </h5>
            <button className="btn-close" onClick={onClose} disabled={saving} />
          </div>

          <div className="modal-body p-4">

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                <i className="bi bi-x-circle-fill flex-shrink-0" />
                <span className="small">{error}</span>
              </div>
            )}

            {/* Job summary */}
            <div className="d-flex align-items-center gap-2 p-2 bg-light rounded-3 mb-4">
              <img
                src={job.landlord?.photo || DEFAULT_AVATAR}
                alt=""
                className="rounded-circle flex-shrink-0"
                width={36} height={36}
                style={{ objectFit: "cover" }}
              />
              <div>
                <div className="fw-semibold small text-truncate">{job.subject}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>{job.landlord?.email}</div>
              </div>
            </div>

            {/* Status options — In Progress and Completed only */}
            <div className="d-grid gap-2">
              {STATUS_OPTIONS.map((s) => (
                <div
                  key={s.value}
                  className={`card border-2 p-3 d-flex flex-row align-items-center gap-3
                    ${status === s.value
                      ? `border-${s.badge} bg-${s.badge} bg-opacity-10`
                      : "border"}`}
                  style={{ cursor: saving ? "not-allowed" : "pointer" }}
                  onClick={() => !saving && setStatus(s.value)}
                >
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0
                      ${status === s.value ? `bg-${s.badge}` : "bg-light"}`}
                    style={{ width: 36, height: 36 }}
                  >
                    <i className={`bi ${s.icon} ${status === s.value ? "text-white" : "text-muted"}`} />
                  </div>
                  <div className="flex-grow-1">
                    <span className={`fw-semibold ${status === s.value ? `text-${s.badge}` : "text-muted"}`}>
                      {s.value}
                    </span>
                    {s.value === "Completed" && (
                      <div className="text-muted" style={{ fontSize: 11 }}>
                        Landlord and resident will be notified
                      </div>
                    )}
                  </div>
                  {status === s.value && (
                    <i className={`bi bi-check2 text-${s.badge} ms-auto fs-5`} />
                  )}
                </div>
              ))}
            </div>

          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              className="btn btn-warning"
              onClick={() => onSave(job._id, status)}
              disabled={saving}
            >
              {saving
                ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                : <><i className="bi bi-check-lg me-1" />Save Status</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
