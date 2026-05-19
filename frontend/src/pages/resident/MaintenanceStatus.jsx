import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getMyRequests } from "../../services/api";
import ResidentMaintenanceViewModal from "../../components/ResidentMaintenanceViewModal";

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

export default function MaintenanceStatus() {
  const { getAccessTokenSilently } = useAuth0();

  const [requests,    setRequests]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [viewRequest, setViewRequest] = useState(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const token = await getAccessTokenSilently();
        const data  = await getMyRequests(token);
        setRequests(data);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const submitted  = requests.filter((r) => r.status === "Submitted").length;
  const inProgress = requests.filter((r) => r.status === "In Progress").length;
  const completed  = requests.filter((r) => r.status === "Completed").length;

  return (
    <div className="p-4">

      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Maintenance Status</h4>
        <p className="text-muted small mb-0">Track the status of your maintenance requests</p>
      </div>

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-3 fw-bold text-secondary">{submitted}</div>
            <div className="text-muted small">
              <i className="bi bi-clock me-1" />Submitted
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-3 fw-bold text-warning">{inProgress}</div>
            <div className="text-muted small">
              <i className="bi bi-arrow-repeat me-1" />In Progress
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-3 fw-bold text-success">{completed}</div>
            <div className="text-muted small">
              <i className="bi bi-check-circle me-1" />Completed
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-clipboard-x fs-1 d-block mb-2 opacity-50" />
          <p className="fw-semibold">No maintenance requests yet</p>
          <small>Submit a request to get started</small>
        </div>
      ) : (
        <div className="row g-4">
          {requests.map((r) => {
            const status     = STATUS_CONFIG[r.status]              || STATUS_CONFIG["Submitted"];
            const priority   = PRIORITY_CONFIG[r.priority]          || PRIORITY_CONFIG["Standard"];
            const assignment = ASSIGNMENT_STATUS_CONFIG[r.assignmentStatus] || ASSIGNMENT_STATUS_CONFIG["Unassigned"];
            const cardImage  = r.photos?.[0]?.url
              || `https://placehold.co/400x200/e9ecef/6c757d?text=${encodeURIComponent(r.priority)}`;

            return (
              <div key={r._id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100">

                  {/* Photo */}
                  <img
                    src={cardImage}
                    alt={r.subject}
                    className="card-img-top"
                    style={{ height: 160, objectFit: "cover" }}
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
                        <i className={`bi ${assignment.icon} me-1`} />{r.assignmentStatus || "Unassigned"}
                      </span>
                    </div>

                    {/* Subject */}
                    <h6 className="fw-bold mb-1 text-truncate">{r.subject}</h6>

                    {/* Description preview */}
                    <p className="text-muted mb-2" style={{ fontSize: 12 }}>
                      {r.description?.length > 80
                        ? r.description.substring(0, 80) + "..."
                        : r.description}
                    </p>

                    {/* Date */}
                    <div className="text-muted small">
                      <i className="bi bi-calendar me-1" />
                      {new Date(r.createdAt).toLocaleDateString([], {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Progress + view button */}
                  <div className="card-footer bg-transparent border-top px-3 pt-2 pb-3">
                    <div className="d-flex justify-content-between small text-muted mb-1">
                      <span>Progress</span>
                      <span className={`text-${status.badge}`}>{r.status}</span>
                    </div>
                    <div className="progress mb-3" style={{ height: 6 }}>
                      <div
                        className={`progress-bar bg-${status.badge}`}
                        style={{ width: PROGRESS_WIDTH[r.status] || "0%" }}
                      />
                    </div>
                    <button
                      className="btn btn-outline-success btn-sm w-100"
                      onClick={() => setViewRequest(r)}
                    >
                      <i className="bi bi-eye me-1" />View Details
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Modal */}
      <ResidentMaintenanceViewModal
        request={viewRequest}
        onClose={() => setViewRequest(null)}
      />

    </div>
  );
}
