import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { getPastJobs } from "../../services/api";
import PastJobViewModal from "../../components/PastJobViewModal";

const PER_PAGE = 6;

const DEFAULT_AVATAR = "https://placehold.co/24x24/cccccc/ffffff?text=?";

const PRIORITY_CONFIG = {
  "Standard":  { badge: "info",    icon: "bi-flag"                     },
  "Urgent":    { badge: "warning", icon: "bi-flag-fill"                 },
  "Emergency": { badge: "danger",  icon: "bi-exclamation-triangle-fill" },
};

export default function PastJobHistory() {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewJob, setViewJob] = useState(null);
  const [page,    setPage]    = useState(1);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const token = await getAccessTokenSilently();
        const data  = await getPastJobs(token);
        setJobs(data);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalPages = Math.ceil(jobs.length / PER_PAGE);
  const paginated  = jobs.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-4">

      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Past Job History</h4>
        <p className="text-muted small mb-0">
          All completed maintenance jobs
          {!loading && (
            <span className="badge bg-success ms-2">{jobs.length} completed</span>
          )}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-clock-history fs-1 d-block mb-2 opacity-50" />
          <p className="fw-semibold">No completed jobs yet</p>
          <small>Completed jobs will appear here</small>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {paginated.map((j) => {
              const priority  = PRIORITY_CONFIG[j.priority] || PRIORITY_CONFIG["Standard"];
              const cardImage = j.photos?.[0]?.url
                || `https://placehold.co/400x200/e9ecef/6c757d?text=${encodeURIComponent(j.priority)}`;

              const completedDate = new Date(j.updatedAt).toLocaleDateString([], {
                year: "numeric", month: "short", day: "numeric",
              });

              return (
                <div key={j._id} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100">

                    {/* Image with completed badge */}
                    <div className="position-relative">
                      <img
                        src={cardImage}
                        alt={j.subject}
                        className="card-img-top"
                        style={{ height: 180, objectFit: "cover" }}
                      />
                      <span className="position-absolute top-0 end-0 m-2 badge bg-success">
                        <i className="bi bi-check-circle me-1" />Completed
                      </span>
                    </div>

                    <div className="card-body">
                      {/* Priority badge */}
                      <div className="d-flex gap-1 flex-wrap mb-2">
                        <span className={`badge bg-${priority.badge}`}>
                          <i className={`bi ${priority.icon} me-1`} />{j.priority}
                        </span>
                      </div>

                      {/* Subject */}
                      <h6 className="fw-bold mb-2 text-truncate">{j.subject}</h6>

                      {/* Landlord */}
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

                      {/* Completed date */}
                      <div className="text-muted small">
                        <i className="bi bi-calendar-check text-success me-1" />
                        Completed: {completedDate}
                      </div>
                    </div>

                    <div className="card-footer bg-transparent border-top-0 pb-3 px-3 d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm flex-grow-1"
                        onClick={() => setViewJob(j)}
                      >
                        <i className="bi bi-eye me-1" />View Details
                      </button>
                      <button
                        className="btn btn-outline-success btn-sm"
                        title="Message landlord"
                        onClick={() => navigate("/messages", { state: { initialUserId: j.landlordId } })}
                      >
                        <i className="bi bi-chat-dots" />
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

      {/* View Modal */}
      <PastJobViewModal
        job={viewJob}
        onClose={() => setViewJob(null)}
      />

    </div>
  );
}
