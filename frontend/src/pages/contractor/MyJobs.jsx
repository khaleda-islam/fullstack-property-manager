import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { getMyJobs, contractorUpdateStatus } from "../../services/api";
import JobUpdateStatusModal from "../../components/JobUpdateStatusModal";
import Toast from "../../components/Toast";

const PER_PAGE = 6;

const DEFAULT_AVATAR = "https://placehold.co/48x48/cccccc/ffffff?text=?";

const PRIORITY_CONFIG = {
  "Standard":  { badge: "info",    icon: "bi-flag"                     },
  "Urgent":    { badge: "warning", icon: "bi-flag-fill"                 },
  "Emergency": { badge: "danger",  icon: "bi-exclamation-triangle-fill" },
};

const STATUS_CONFIG = {
  "Submitted":   { badge: "secondary", icon: "bi-clock"        },
  "In Progress": { badge: "warning",   icon: "bi-arrow-repeat" },
  "Completed":   { badge: "success",   icon: "bi-check-circle" },
};

// ── View Modal ─────────────────────────────────────────────────────────────────
function ViewModal({ job, onClose }) {
  if (!job) return null;
  const priority = PRIORITY_CONFIG[job.priority] || PRIORITY_CONFIG["Standard"];
  const status   = STATUS_CONFIG[job.status]     || STATUS_CONFIG["Submitted"];

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-briefcase me-2 text-primary" />Job Details
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body p-4">

            <div className="d-flex gap-2 flex-wrap mb-4">
              <span className={`badge bg-${status.badge} fs-6 px-3 py-2`}>
                <i className={`bi ${status.icon} me-1`} />{job.status}
              </span>
              <span className={`badge bg-${priority.badge} fs-6 px-3 py-2`}>
                <i className={`bi ${priority.icon} me-1`} />{job.priority}
              </span>
            </div>

            <div className="card border-0 bg-light rounded-3 mb-3">
              <div className="card-body p-3">
                <div className="text-muted small text-uppercase fw-semibold mb-1">Subject</div>
                <div className="fw-bold mb-3">{job.subject}</div>
                <div className="text-muted small text-uppercase fw-semibold mb-1">Description</div>
                <div className="text-muted" style={{ lineHeight: 1.7 }}>{job.description}</div>
              </div>
            </div>

            <div className="card border-0 bg-light rounded-3 mb-3">
              <div className="card-body p-3">
                <div className="text-muted small text-uppercase fw-semibold mb-1">Property Location</div>
                <div className="fw-semibold">
                  <i className="bi bi-geo-alt text-danger me-1" />{job.propertyLocation || "—"}
                </div>
              </div>
            </div>

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
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MyJobs() {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const [jobs,      setJobs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [viewJob,   setViewJob]   = useState(null);
  const [updateJob, setUpdateJob] = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [modalError,setModalError]= useState("");
  const [page,      setPage]      = useState(1);
  const [toast,     setToast]     = useState({ show: false, type: "success", message: "" });

  const showToast = (type, message) => setToast({ show: true, type, message });

  // ── Load accepted jobs ────────────────────────────────────────────────────
  const load = async () => {
    try {
      const token = await getAccessTokenSilently();
      const data  = await getMyJobs(token);
      setJobs(data);
    } catch {
      showToast("danger", "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Update status ─────────────────────────────────────────────────────────
  const handleUpdateStatus = async (id, status) => {
    setSaving(true);
    setModalError("");
    try {
      const token = await getAccessTokenSilently();
      await contractorUpdateStatus(token, id, status);
      await load();
      setUpdateJob(null);
      showToast("success", `Status updated to "${status}". Landlord and resident notified.`);
    } catch {
      setModalError("Failed to update status.");
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(jobs.length / PER_PAGE);
  const paginated  = jobs.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-4">

      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">My Jobs</h4>
        <p className="text-muted small mb-0">
          Maintenance requests you have accepted
          {jobs.length > 0 && (
            <span className="badge bg-warning text-dark ms-2">{jobs.length} active</span>
          )}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-briefcase fs-1 d-block mb-2 opacity-50" />
          <p className="fw-semibold">No active jobs</p>
          <small>Accepted jobs will appear here</small>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {paginated.map((j) => {
              const priority  = PRIORITY_CONFIG[j.priority] || PRIORITY_CONFIG["Standard"];
              const status    = STATUS_CONFIG[j.status]     || STATUS_CONFIG["Submitted"];
              const cardImage = j.photos?.[0]?.url
                || `https://placehold.co/400x200/e9ecef/6c757d?text=${encodeURIComponent(j.priority)}`;

              return (
                <div key={j._id} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100">
                    <img
                      src={cardImage}
                      alt={j.subject}
                      className="card-img-top"
                      style={{ height: 180, objectFit: "cover" }}
                    />
                    <div className="card-body">
                      <div className="d-flex gap-1 flex-wrap mb-2">
                        <span className={`badge bg-${status.badge}`}>
                          <i className={`bi ${status.icon} me-1`} />{j.status}
                        </span>
                        <span className={`badge bg-${priority.badge}`}>
                          <i className={`bi ${priority.icon} me-1`} />{j.priority}
                        </span>
                      </div>
                      <h6 className="fw-bold mb-2 text-truncate">{j.subject}</h6>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <img
                          src={j.landlord?.photo || DEFAULT_AVATAR}
                          alt={j.landlord?.name}
                          className="rounded-circle border flex-shrink-0"
                          width={24} height={24}
                          style={{ objectFit: "cover" }}
                        />
                        <span className="text-muted small text-truncate">
                          {j.landlord?.email || "—"}
                        </span>
                      </div>
                      <div className="text-muted small">
                        <i className="bi bi-calendar me-1" />
                        {new Date(j.createdAt).toLocaleDateString([], {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="card-footer bg-transparent border-top-0 pb-3 px-3 d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm flex-grow-1"
                        onClick={() => setViewJob(j)}
                      >
                        <i className="bi bi-eye me-1" />View
                      </button>
                      <button
                        className="btn btn-outline-success btn-sm"
                        title="Message landlord"
                        onClick={() => navigate("/messages", { state: { initialUserId: j.landlordId } })}
                      >
                        <i className="bi bi-chat-dots" />
                      </button>
                      <button
                        className="btn btn-outline-warning btn-sm flex-grow-1"
                        onClick={() => { setUpdateJob(j); setModalError(""); }}
                      >
                        <i className="bi bi-pencil me-1" />Status
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <nav className="d-flex justify-content-center">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>
                    <i className="bi bi-chevron-left" />
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <li key={p} className={`page-item ${page === p ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>
                    <i className="bi bi-chevron-right" />
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      <ViewModal job={viewJob} onClose={() => setViewJob(null)} />

      <JobUpdateStatusModal
        job={updateJob}
        saving={saving}
        error={modalError}
        onSave={handleUpdateStatus}
        onClose={() => setUpdateJob(null)}
      />

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />
    </div>
  );
}
