// ── Usage ─────────────────────────────────────────────────────────────────────
// <ResidentMaintenanceViewModal
//   request={viewRequest}
//   onClose={() => setViewRequest(null)}
// />
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  "Submitted":   { badge: "secondary", icon: "bi-clock"        },
  "In Progress": { badge: "warning",   icon: "bi-arrow-repeat" },
  "Completed":   { badge: "success",   icon: "bi-check-circle" },
};

const PRIORITY_CONFIG = {
  "Standard":  { badge: "info",    icon: "bi-flag"                     },
  "Urgent":    { badge: "warning", icon: "bi-flag-fill"                 },
  "Emergency": { badge: "danger",  icon: "bi-exclamation-triangle-fill" },
};

const ASSIGNMENT_STATUS_CONFIG = {
  "Unassigned": { badge: "secondary", icon: "bi-person-dash"    },
  "Pending":    { badge: "info",      icon: "bi-hourglass-split" },
  "Accepted":   { badge: "success",   icon: "bi-person-check"   },
  "Declined":   { badge: "danger",    icon: "bi-person-x"       },
};

const PROGRESS_WIDTH = {
  "Submitted":   "25%",
  "In Progress": "60%",
  "Completed":   "100%",
};

export default function ResidentMaintenanceViewModal({
  request = null,
  onClose = () => {},
}) {
  if (!request) return null;

  const status     = STATUS_CONFIG[request.status]              || STATUS_CONFIG["Submitted"];
  const priority   = PRIORITY_CONFIG[request.priority]          || PRIORITY_CONFIG["Standard"];
  const assignment = ASSIGNMENT_STATUS_CONFIG[request.assignmentStatus] || ASSIGNMENT_STATUS_CONFIG["Unassigned"];

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow">

          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-clipboard-check me-2 text-success" />Request Details
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body p-4">

            {/* Badges */}
            <div className="d-flex gap-2 flex-wrap mb-4">
              <span className={`badge bg-${status.badge} fs-6 px-3 py-2`}>
                <i className={`bi ${status.icon} me-1`} />{request.status}
              </span>
              <span className={`badge bg-${priority.badge} fs-6 px-3 py-2`}>
                <i className={`bi ${priority.icon} me-1`} />{request.priority}
              </span>
              <span className={`badge bg-${assignment.badge} fs-6 px-3 py-2`}>
                <i className={`bi ${assignment.icon} me-1`} />{request.assignmentStatus || "Unassigned"}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Progress</span>
                <span className={`text-${status.badge}`}>{request.status}</span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div
                  className={`progress-bar bg-${status.badge}`}
                  style={{ width: PROGRESS_WIDTH[request.status] || "0%" }}
                />
              </div>
            </div>

            {/* Subject + description */}
            <div className="card border-0 bg-light rounded-3 mb-3">
              <div className="card-body p-3">
                <div className="text-muted small text-uppercase fw-semibold mb-1">Subject</div>
                <div className="fw-bold mb-3">{request.subject}</div>
                <div className="text-muted small text-uppercase fw-semibold mb-1">Description</div>
                <div className="text-muted" style={{ lineHeight: 1.7 }}>{request.description}</div>
              </div>
            </div>

            {/* Dates */}
            <div className="card border-0 bg-light rounded-3 mb-3">
              <div className="card-body p-3">
                <div className="text-muted small text-uppercase fw-semibold mb-2">Timeline</div>
                <div className="row g-2">
                  <div className="col-6">
                    <div className="text-muted small mb-1">Submitted</div>
                    <div className="fw-semibold small">
                      <i className="bi bi-calendar me-1" />
                      {new Date(request.createdAt).toLocaleDateString([], {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </div>
                  </div>
                  {request.status === "Completed" && request.updatedAt && (
                    <div className="col-6">
                      <div className="text-muted small mb-1">Completed</div>
                      <div className="fw-semibold small text-success">
                        <i className="bi bi-calendar-check me-1" />
                        {new Date(request.updatedAt).toLocaleDateString([], {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Photos */}
            {request.photos?.length > 0 && (
              <div className="card border-0 bg-light rounded-3">
                <div className="card-header bg-transparent border-bottom fw-semibold small py-2 px-3">
                  <i className="bi bi-images me-1" />Photos ({request.photos.length})
                </div>
                <div className="card-body p-3">
                  <div className="row g-2">
                    {request.photos.map((photo, i) => (
                      <div key={i} className="col-4">
                        <img
                          src={photo.url}
                          alt={`photo-${i + 1}`}
                          className="rounded-3 w-100"
                          style={{ height: 110, objectFit: "cover" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="modal-footer">
            <div className="text-muted small me-auto">
              <i className="bi bi-calendar me-1" />
              Submitted: {new Date(request.createdAt).toLocaleDateString([], {
                year: "numeric", month: "long", day: "numeric",
              })}
            </div>
            <button className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          </div>

        </div>
      </div>
    </div>
  );
}
