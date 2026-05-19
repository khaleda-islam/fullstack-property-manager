import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getPropertyRequests, updateStatus } from "../../services/api";
import MaintenanceEditModal from "../../components/MaintenanceEditModal";
import MaintenanceViewModal from "../../components/MaintenanceViewModal";
import Toast from "../../components/Toast";

const DEFAULT_AVATAR = "https://placehold.co/48x48/cccccc/ffffff?text=?";
const PER_PAGE       = 6;

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
  "Unassigned":  { badge: "secondary", icon: "bi-person-dash"  },
  "Assigned":    { badge: "primary",   icon: "bi-person-check" },
  "In Progress": { badge: "warning",   icon: "bi-arrow-repeat" },
  "Completed":   { badge: "success",   icon: "bi-check-circle" },
};

export default function MaintenanceRequestsPage({ property, onBack }) {
  const { getAccessTokenSilently } = useAuth0();

  const [requests,    setRequests]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);
  const [viewRequest, setViewRequest] = useState(null);
  const [editRequest, setEditRequest] = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [modalError,  setModalError]  = useState("");
  const [toast,       setToast]       = useState({ show: false, type: "success", message: "" });

  const showToast = (type, message) => setToast({ show: true, type, message });

  // ── Load all requests — no filtering, show everything ──────────────────────
  const load = async () => {
    try {
      const token = await getAccessTokenSilently();
      const data  = await getPropertyRequests(token, property._id);
      setRequests(data);
    } catch {
      showToast("danger", "Failed to load maintenance requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Update status ─────────────────────────────────────────────────────────
  const handleUpdateStatus = async (status) => {
    setSaving(true);
    setModalError("");
    try {
      const token = await getAccessTokenSilently();
      await updateStatus(token, editRequest._id, status);
      await load();
      setEditRequest(null);
      showToast("success", `Status updated to "${status}".`);
    } catch {
      setModalError("Failed to update status.");
    } finally {
      setSaving(false);
    }
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(requests.length / PER_PAGE);
  const paginated  = requests.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Summary counts — all statuses ─────────────────────────────────────────
  const counts = {
    submitted:  requests.filter((r) => r.status === "Submitted").length,
    inProgress: requests.filter((r) => r.status === "In Progress").length,
    completed:  requests.filter((r) => r.status === "Completed").length,
  };

  return (
    <div className="p-4">

      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>
          <i className="bi bi-arrow-left me-1" />Back
        </button>
        <div className="flex-grow-1">
          <h4 className="fw-bold mb-0">Maintenance Requests</h4>
          <p className="text-muted small mb-0">
            <i className="bi bi-building me-1" />{property.name}
          </p>
        </div>
      </div>

      {/* Summary — all 3 statuses */}
      <div className="row g-3 mb-4">
        <div className="col-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-3 fw-bold text-secondary">{counts.submitted}</div>
            <div className="text-muted small"><i className="bi bi-clock me-1" />Submitted</div>
          </div>
        </div>
        <div className="col-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-3 fw-bold text-warning">{counts.inProgress}</div>
            <div className="text-muted small"><i className="bi bi-arrow-repeat me-1" />In Progress</div>
          </div>
        </div>
        <div className="col-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-3 fw-bold text-success">{counts.completed}</div>
            <div className="text-muted small"><i className="bi bi-check-circle me-1" />Completed</div>
          </div>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-clipboard-x fs-1 d-block mb-2 opacity-50" />
          <p>No maintenance requests yet.</p>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {paginated.map((r) => {
              const status     = STATUS_CONFIG[r.status]              || STATUS_CONFIG["Submitted"];
              const priority   = PRIORITY_CONFIG[r.priority]          || PRIORITY_CONFIG["Standard"];
              const assignment = ASSIGNMENT_STATUS_CONFIG[r.assignmentStatus] || ASSIGNMENT_STATUS_CONFIG["Unassigned"];
              const cardImage  = r.photos?.[0]?.url
                || `https://placehold.co/400x200/e9ecef/6c757d?text=${encodeURIComponent(r.priority || "Request")}`;

              return (
                <div key={r._id} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100">

                    {/* Photo */}
                    <img
                      src={cardImage}
                      alt={r.subject}
                      className="card-img-top"
                      style={{ height: 180, objectFit: "cover" }}
                    />

                    <div className="card-body">
                      {/* Badges */}
                      <div className="d-flex gap-1 flex-wrap mb-2">
                        <span className={`badge bg-${status.badge}`}>
                          <i className={`bi ${status.icon} me-1`} />{r.status}
                        </span>
                        <span className={`badge bg-${priority.badge}`}>
                          <i className={`bi ${priority.icon} me-1`} />{r.priority}
                        </span>
                        <span className={`badge bg-${assignment.badge}`}>
                          <i className={`bi ${assignment.icon} me-1`} />{r.assignmentStatus}
                        </span>
                      </div>

                      {/* Subject */}
                      <h6 className="fw-bold mb-1 text-truncate">{r.subject}</h6>

                      {/* Resident */}
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <img
                          src={r.residentPhoto || DEFAULT_AVATAR}
                          alt="resident"
                          className="rounded-circle border flex-shrink-0"
                          width={24} height={24}
                          style={{ objectFit: "cover" }}
                        />
                        <span className="text-muted small text-truncate">{r.residentEmail}</span>
                      </div>

                      {/* Date */}
                      <div className="text-muted small">
                        <i className="bi bi-calendar me-1" />
                        {new Date(r.createdAt).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="card-footer bg-transparent border-top-0 pb-3 px-3 d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm flex-grow-1"
                        onClick={() => setViewRequest(r)}
                      >
                        <i className="bi bi-eye me-1" />View
                      </button>
                      <button
                        className="btn btn-outline-warning btn-sm flex-grow-1"
                        onClick={() => { setEditRequest(r); setModalError(""); }}
                      >
                        <i className="bi bi-pencil me-1" />Edit Status
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
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

      {/* Modals — now separate reusable components */}
      <MaintenanceViewModal
        request={viewRequest}
        onClose={() => setViewRequest(null)}
      />
      <MaintenanceEditModal
        request={editRequest}
        saving={saving}
        error={modalError}
        onSave={handleUpdateStatus}
        onClose={() => setEditRequest(null)}
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
