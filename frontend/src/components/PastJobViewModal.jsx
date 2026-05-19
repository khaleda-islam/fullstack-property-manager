// ── Usage ─────────────────────────────────────────────────────────────────────
// <PastJobViewModal
//   job={viewJob}
//   onClose={() => setViewJob(null)}
// />
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_AVATAR = "https://placehold.co/48x48/cccccc/ffffff?text=?";

const PRIORITY_CONFIG = {
  "Standard":  { badge: "info",    icon: "bi-flag"                     },
  "Urgent":    { badge: "warning", icon: "bi-flag-fill"                 },
  "Emergency": { badge: "danger",  icon: "bi-exclamation-triangle-fill" },
};

export default function PastJobViewModal({ job = null, onClose = () => {} }) {
  if (!job) return null;

  const priority = PRIORITY_CONFIG[job.priority] || PRIORITY_CONFIG["Standard"];

  const submittedDate = new Date(job.createdAt).toLocaleDateString([], {
    year: "numeric", month: "long", day: "numeric",
  });

  const completedDate = new Date(job.updatedAt).toLocaleDateString([], {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow">

          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-clock-history me-2 text-success" />Past Job Details
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body p-4">

            {/* Badges */}
            <div className="d-flex gap-2 flex-wrap mb-4">
              <span className="badge bg-success fs-6 px-3 py-2">
                <i className="bi bi-check-circle me-1" />Completed
              </span>
              <span className={`badge bg-${priority.badge} fs-6 px-3 py-2`}>
                <i className={`bi ${priority.icon} me-1`} />{job.priority}
              </span>
            </div>

            {/* Subject + description */}
            <div className="card border-0 bg-light rounded-3 mb-3">
              <div className="card-body p-3">
                <div className="text-muted small text-uppercase fw-semibold mb-1">Subject</div>
                <div className="fw-bold mb-3">{job.subject}</div>
                <div className="text-muted small text-uppercase fw-semibold mb-1">Description</div>
                <div className="text-muted" style={{ lineHeight: 1.7 }}>{job.description}</div>
              </div>
            </div>

            {/* Property */}
            <div className="card border-0 bg-light rounded-3 mb-3">
              <div className="card-body p-3">
                <div className="text-muted small text-uppercase fw-semibold mb-1">Property Location</div>
                <div className="fw-semibold">
                  <i className="bi bi-geo-alt text-danger me-1" />
                  {job.propertyLocation || "—"}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="card border-0 bg-light rounded-3 mb-3">
              <div className="card-body p-3">
                <div className="text-muted small text-uppercase fw-semibold mb-2">Timeline</div>
                <div className="row g-2">
                  <div className="col-6">
                    <div className="text-muted small mb-1">
                      <i className="bi bi-calendar me-1" />Submitted
                    </div>
                    <div className="fw-semibold small">{submittedDate}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted small mb-1">
                      <i className="bi bi-calendar-check me-1 text-success" />Completed
                    </div>
                    <div className="fw-semibold small text-success">{completedDate}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Landlord */}
            <div className="card border-0 bg-light rounded-3 mb-3">
              <div className="card-header bg-transparent border-bottom fw-semibold small py-2 px-3">
                <i className="bi bi-person-badge me-1" />Landlord
              </div>
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <img
                  src={job.landlord?.photo || DEFAULT_AVATAR}
                  alt={job.landlord?.name}
                  className="rounded-circle border"
                  width={48} height={48}
                  style={{ objectFit: "cover" }}
                />
                <div>
                  <div className="fw-semibold">{job.landlord?.name || "—"}</div>
                  <div className="text-muted small">
                    <i className="bi bi-envelope me-1" />{job.landlord?.email || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Photos */}
            {job.photos?.length > 0 && (
              <div className="card border-0 bg-light rounded-3">
                <div className="card-header bg-transparent border-bottom fw-semibold small py-2 px-3">
                  <i className="bi bi-images me-1" />Photos ({job.photos.length})
                </div>
                <div className="card-body p-3">
                  <div className="row g-2">
                    {job.photos.map((photo, i) => (
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
              <i className="bi bi-check-circle text-success me-1" />
              Completed on {completedDate}
            </div>
            <button className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          </div>

        </div>
      </div>
    </div>
  );
}
