import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { getAssignedRequests, respondToAssignment } from "../../services/api";
import AcceptDeclineButtons from "../../components/AcceptDeclineButtons";
import Toast from "../../components/Toast";

const PER_PAGE = 6;

const DEFAULT_AVATAR = "https://placehold.co/48x48/cccccc/ffffff?text=?";

const PRIORITY_CONFIG = {
  "Standard":  { badge: "info",    icon: "bi-flag"                     },
  "Urgent":    { badge: "warning", icon: "bi-flag-fill"                 },
  "Emergency": { badge: "danger",  icon: "bi-exclamation-triangle-fill" },
};

// ── View Modal ─────────────────────────────────────────────────────────────────
function ViewModal({ request, responding, onClose, onAccept, onDecline }) {
  if (!request) return null;
  const priority = PRIORITY_CONFIG[request.priority] || PRIORITY_CONFIG["Standard"];

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-clipboard-check me-2 text-primary" />Request Details
            </h5>
            <button className="btn-close" onClick={onClose} disabled={responding} />
          </div>
          <div className="modal-body p-4">

            {/* Priority badge */}
            <div className="d-flex gap-2 flex-wrap mb-4">
              <span className={`badge bg-${priority.badge} fs-6 px-3 py-2`}>
                <i className={`bi ${priority.icon} me-1`} />{request.priority}
              </span>
              <span className="badge bg-info fs-6 px-3 py-2">
                <i className="bi bi-hourglass-split me-1" />Pending Response
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

            {/* Property */}
            <div className="card border-0 bg-light rounded-3 mb-3">
              <div className="card-body p-3">
                <div className="text-muted small text-uppercase fw-semibold mb-1">Property Location</div>
                <div className="fw-semibold">
                  <i className="bi bi-geo-alt text-danger me-1" />
                  {request.propertyLocation || "—"}
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
                  src={request.landlord?.photo || DEFAULT_AVATAR}
                  alt={request.landlord?.name}
                  className="rounded-circle border"
                  width={48} height={48}
                  style={{ objectFit: "cover" }}
                />
                <div>
                  <div className="fw-semibold">{request.landlord?.name || "—"}</div>
                  <div className="text-muted small">
                    <i className="bi bi-envelope me-1" />{request.landlord?.email || "—"}
                  </div>
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
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose} disabled={responding}>
              Close
            </button>
            <AcceptDeclineButtons
              id={request._id}
              responding={responding}
              onAccept={onAccept}
              onDecline={onDecline}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MaintenanceRequests() {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const [requests,    setRequests]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [viewRequest, setViewRequest] = useState(null);
  const [responding,  setResponding]  = useState(false);
  const [page,        setPage]        = useState(1);
  const [toast,       setToast]       = useState({ show: false, type: "success", message: "" });

  const showToast = (type, message) => setToast({ show: true, type, message });

  // ── Load pending assigned requests ─────────────────────────────────────────
  const load = async () => {
    try {
      const token = await getAccessTokenSilently();
      const data  = await getAssignedRequests(token);
      setRequests(data);
    } catch {
      showToast("danger", "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Accept ─────────────────────────────────────────────────────────────────
  const handleAccept = async (id) => {
    setResponding(true);
    try {
      const token = await getAccessTokenSilently();
      await respondToAssignment(token, id, "Accepted");
      setViewRequest(null);
      await load();
      showToast("success", "Job accepted! It has moved to My Jobs.");
    } catch {
      showToast("danger", "Failed to accept request.");
    } finally {
      setResponding(false);
    }
  };

  // ── Decline ────────────────────────────────────────────────────────────────
  const handleDecline = async (id) => {
    if (!window.confirm("Decline this job request?")) return;
    setResponding(true);
    try {
      const token = await getAccessTokenSilently();
      await respondToAssignment(token, id, "Declined");
      setViewRequest(null);
      await load();
      showToast("success", "Job declined.");
    } catch {
      showToast("danger", "Failed to decline request.");
    } finally {
      setResponding(false);
    }
  };

  const totalPages = Math.ceil(requests.length / PER_PAGE);
  const paginated  = requests.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-4">

      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Maintenance Requests</h4>
        <p className="text-muted small mb-0">
          Review and accept or decline assigned requests
          {requests.length > 0 && (
            <span className="badge bg-info ms-2">{requests.length} pending</span>
          )}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-clipboard-check fs-1 d-block mb-2 opacity-50" />
          <p className="fw-semibold">No pending requests</p>
          <small>New job assignments will appear here</small>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {paginated.map((r) => {
              const priority  = PRIORITY_CONFIG[r.priority] || PRIORITY_CONFIG["Standard"];
              const cardImage = r.photos?.[0]?.url
                || `https://placehold.co/400x200/e9ecef/6c757d?text=${encodeURIComponent(r.priority)}`;

              return (
                <div key={r._id} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100">
                    <img
                      src={cardImage}
                      alt={r.subject}
                      className="card-img-top"
                      style={{ height: 180, objectFit: "cover" }}
                    />
                    <div className="card-body">
                      <div className="d-flex gap-1 flex-wrap mb-2">
                        <span className={`badge bg-${priority.badge}`}>
                          <i className={`bi ${priority.icon} me-1`} />{r.priority}
                        </span>
                        <span className="badge bg-info">
                          <i className="bi bi-hourglass-split me-1" />Pending
                        </span>
                      </div>
                      <h6 className="fw-bold mb-2 text-truncate">{r.subject}</h6>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <img
                          src={r.landlord?.photo || DEFAULT_AVATAR}
                          alt={r.landlord?.name}
                          className="rounded-circle border flex-shrink-0"
                          width={24} height={24}
                          style={{ objectFit: "cover" }}
                        />
                        <span className="text-muted small text-truncate">
                          {r.landlord?.email || "—"}
                        </span>
                      </div>
                      <div className="text-muted small">
                        <i className="bi bi-calendar me-1" />
                        {new Date(r.createdAt).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })}
                      </div>
                    </div>
                    <div className="card-footer bg-transparent border-top-0 pb-3 px-3 d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm flex-grow-1"
                        onClick={() => setViewRequest(r)}
                      >
                        <i className="bi bi-eye me-1" />View
                      </button>
                      <button
                        className="btn btn-outline-success btn-sm"
                        title="Message landlord"
                        onClick={() => navigate("/messages", { state: { initialUserId: r.landlordId } })}
                      >
                        <i className="bi bi-chat-dots" />
                      </button>
                      <AcceptDeclineButtons
                        id={r._id}
                        responding={responding}
                        onAccept={handleAccept}
                        onDecline={handleDecline}
                      />
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

      <ViewModal
        request={viewRequest}
        responding={responding}
        onClose={() => setViewRequest(null)}
        onAccept={handleAccept}
        onDecline={handleDecline}
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
