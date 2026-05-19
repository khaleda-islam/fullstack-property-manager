// ── Usage ─────────────────────────────────────────────────────────────────────
// <MaintenanceEditModal
//   request={editRequest}
//   saving={saving}
//   error={error}
//   onSave={(status) => {}}
//   onClose={() => {}}
// />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import Alert from "./Alert";

const DEFAULT_AVATAR = "https://placehold.co/36x36/cccccc/ffffff?text=?";

const STATUS_OPTIONS = [
  { value: "Submitted",   badge: "secondary", icon: "bi-clock"        },
  { value: "In Progress", badge: "warning",   icon: "bi-arrow-repeat" },
  { value: "Completed",   badge: "success",   icon: "bi-check-circle" },
];

export default function MaintenanceEditModal({
  request  = null,
  saving   = false,
  error    = "",
  onSave   = () => {},
  onClose  = () => {},
}) {
  const [status, setStatus] = useState("Submitted");

  useEffect(() => {
    if (request) setStatus(request.status || "Submitted");
  }, [request]);

  if (!request) return null;

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
        <div className="modal-content border-0 shadow">

          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-pencil me-2 text-warning" />Edit Request Status
            </h5>
            <button className="btn-close" onClick={onClose} disabled={saving} />
          </div>

          <div className="modal-body p-4">
            {error && <Alert type="danger" message={error} />}

            {/* Request summary */}
            <div className="d-flex align-items-center gap-2 p-2 bg-light rounded-3 mb-4">
              <img
                src={request.residentPhoto || DEFAULT_AVATAR}
                alt=""
                className="rounded-circle flex-shrink-0"
                width={36} height={36}
                style={{ objectFit: "cover" }}
              />
              <div>
                <div className="fw-semibold small text-truncate">{request.subject}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>{request.residentEmail}</div>
              </div>
            </div>

            {/* Status options */}
            <div className="d-grid gap-2">
              {STATUS_OPTIONS.map((s) => (
                <div
                  key={s.value}
                  className={`card border-2 p-3 d-flex flex-row align-items-center gap-3 ${status === s.value ? `border-${s.badge} bg-${s.badge} bg-opacity-10` : "border"}`}
                  style={{ cursor: saving ? "not-allowed" : "pointer" }}
                  onClick={() => !saving && setStatus(s.value)}
                >
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${status === s.value ? `bg-${s.badge}` : "bg-light"}`}
                    style={{ width: 36, height: 36 }}
                  >
                    <i className={`bi ${s.icon} ${status === s.value ? "text-white" : "text-muted"}`} />
                  </div>
                  <span className={`fw-semibold ${status === s.value ? `text-${s.badge}` : "text-muted"}`}>
                    {s.value}
                  </span>
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
              onClick={() => onSave(status)}
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
