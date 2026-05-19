// ── Usage ─────────────────────────────────────────────────────────────────────
// <MaintenanceViewModal
//   request={viewRequest}
//   onClose={() => {}}
// />
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_AVATAR      = "https://placehold.co/48x48/cccccc/ffffff?text=?";
const DEFAULT_CONTRACTOR  = "https://placehold.co/48x48/aaaaaa/ffffff?text=?";

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
  "Unassigned":  { badge: "secondary", icon: "bi-person-dash"   },
  "Pending":     { badge: "info",      icon: "bi-hourglass-split"},
  "Accepted":    { badge: "success",   icon: "bi-person-check"  },
  "Declined":    { badge: "danger",    icon: "bi-person-x"      },
  "In Progress": { badge: "warning",   icon: "bi-arrow-repeat"  },
  "Completed":   { badge: "success",   icon: "bi-check-circle"  },
};

export default function MaintenanceViewModal({
  request              = null,
  onClose              = () => {},
  onSearchContractor   = null,
  onUnassign           = null,   // if provided, shows remove contractor button
}) {
  if (!request) return null;

  const status     = STATUS_CONFIG[request.status]              || STATUS_CONFIG["Submitted"];
  const priority   = PRIORITY_CONFIG[request.priority]          || PRIORITY_CONFIG["Standard"];
  const assignment = ASSIGNMENT_STATUS_CONFIG[request.assignmentStatus] || ASSIGNMENT_STATUS_CONFIG["Unassigned"];

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow">

          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-clipboard-check me-2 text-primary" />Request Details
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body p-4">

            {/* Badges row */}
            <div className="d-flex gap-2 flex-wrap mb-4">
              <span className={`badge bg-${status.badge} fs-6 px-3 py-2`}>
                <i className={`bi ${status.icon} me-1`} />{request.status}
              </span>
              <span className={`badge bg-${priority.badge} fs-6 px-3 py-2`}>
                <i className={`bi ${priority.icon} me-1`} />{request.priority}
              </span>
              <span className={`badge bg-${assignment.badge} fs-6 px-3 py-2`}>
                <i className={`bi ${assignment.icon} me-1`} />{request.assignmentStatus}
              </span>
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

            {/* Property location */}
            <div className="card border-0 bg-light rounded-3 mb-3">
              <div className="card-body p-3">
                <div className="text-muted small text-uppercase fw-semibold mb-1">Property Location</div>
                <div className="fw-semibold">
                  <i className="bi bi-geo-alt text-danger me-1" />
                  {request.propertyLocation || "—"}
                </div>
              </div>
            </div>

            {/* Resident */}
            <div className="card border-0 bg-light rounded-3 mb-3">
              <div className="card-header bg-transparent border-bottom fw-semibold small py-2 px-3">
                <i className="bi bi-person me-1" />Resident
              </div>
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <img
                  src={request.residentPhoto || DEFAULT_AVATAR}
                  alt="resident"
                  className="rounded-circle border"
                  width={48} height={48}
                  style={{ objectFit: "cover" }}
                />
                <div className="text-muted small">
                  <i className="bi bi-envelope me-1" />{request.residentEmail || "—"}
                </div>
              </div>
            </div>

            {/* Contractor */}
            <div className="card border-0 bg-light rounded-3 mb-3">
              <div className="card-header bg-transparent border-bottom fw-semibold small py-2 px-3">
                <i className="bi bi-tools me-1" />Contractor
                <span className={`badge bg-${ASSIGNMENT_STATUS_CONFIG[request.assignmentStatus]?.badge || "secondary"} ms-2`}>
                  {request.assignmentStatus}
                </span>
              </div>
              <div className="card-body p-3">
                {request.contractor ? (
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={request.contractor.photo || DEFAULT_CONTRACTOR}
                      alt="contractor"
                      className="rounded-circle border flex-shrink-0"
                      width={52} height={52}
                      style={{ objectFit: "cover" }}
                    />
                    <div>
                      <div className="fw-semibold">
                        {[request.contractor.firstName, request.contractor.lastName].filter(Boolean).join(" ") || "—"}
                      </div>
                      <div className="text-muted small">
                        <i className="bi bi-envelope me-1" />{request.contractor.email || "—"}
                      </div>
                      {request.contractor.jobType && (
                        <span className="badge bg-warning text-dark mt-1">
                          <i className="bi bi-tools me-1" />{request.contractor.jobType}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <i className="bi bi-person-dash fs-4" />
                    <div>
                      <div className="fw-semibold small">No contractor assigned</div>
                      <div style={{ fontSize: 11 }}>Use Search Contractor to assign one</div>
                    </div>
                  </div>
                )}
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

          <div className="modal-footer">
            <div className="text-muted small me-auto">
              <i className="bi bi-calendar me-1" />
              Submitted: {new Date(request.createdAt).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" })}
            </div>

            {/* Remove contractor — only when contractor is assigned */}
            {onUnassign && request.contractorId && (
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  if (window.confirm("Remove contractor from this request? Status will return to Unassigned.")) {
                    onUnassign(request);
                    onClose();
                  }
                }}
              >
                <i className="bi bi-person-dash me-1" />Remove Contractor
              </button>
            )}

            {/* Search contractor — only when Unassigned or Declined */}
            {onSearchContractor && ["Unassigned", "Declined"].includes(request.assignmentStatus) && (
              <button
                className="btn btn-warning btn-sm"
                onClick={() => { onClose(); onSearchContractor(request); }}
              >
                <i className="bi bi-search me-1" />Search Contractor
              </button>
            )}

            <button className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          </div>

        </div>
      </div>
    </div>
  );
}
