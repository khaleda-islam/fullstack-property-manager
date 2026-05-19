import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getLandlordCompletedRequests, createRating, checkRating } from "../../services/api";
import RateContractorModal from "../../components/RateContractorModal";
import RateButton          from "../../components/RateButton";
import Toast               from "../../components/Toast";

const PER_PAGE = 6;

const PRIORITY_CONFIG = {
  "Standard":  { badge: "info",    icon: "bi-flag"                     },
  "Urgent":    { badge: "warning", icon: "bi-flag-fill"                 },
  "Emergency": { badge: "danger",  icon: "bi-exclamation-triangle-fill" },
};

const DEFAULT_AVATAR = "https://placehold.co/24x24/cccccc/ffffff?text=?";

export default function CompletedRequests() {
  const { getAccessTokenSilently } = useAuth0();

  const [requests,   setRequests]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [rateRequest,setRateRequest]= useState(null);
  const [saving,     setSaving]     = useState(false);
  const [modalError, setModalError] = useState("");
  const [ratedMap,   setRatedMap]   = useState({});
  const [toast,      setToast]      = useState({ show: false, type: "success", message: "" });

  const showToast = (type, message) => setToast({ show: true, type, message });

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = async () => {
    try {
      const token = await getAccessTokenSilently();
      const data  = await getLandlordCompletedRequests(token);
      setRequests(data);

      // Check rating status for each request in parallel
      const ratedResults = {};
      await Promise.all(
        data.map(async (r) => {
          try {
            const result = await checkRating(token, r._id);
            ratedResults[r._id] = result;
          } catch {
            ratedResults[r._id] = { rated: false, rating: null };
          }
        })
      );
      setRatedMap(ratedResults);
    } catch {
      showToast("danger", "Failed to load completed requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Submit rating ─────────────────────────────────────────────────────────
  const handleRate = async (rating, comment) => {
    if (!rateRequest) return;
    setSaving(true);
    setModalError("");
    try {
      const token = await getAccessTokenSilently();
      await createRating(token, {
        contractorId:  rateRequest.contractorId,
        maintenanceId: rateRequest._id,
        rating,
        comment,
      });
      // Update local rated map immediately
      setRatedMap((prev) => ({
        ...prev,
        [rateRequest._id]: { rated: true, rating: { rating } },
      }));
      setRateRequest(null);
      showToast("success", `Rating submitted! ${rating}/10`);
    } catch (err) {
      setModalError(err.message || "Failed to submit rating.");
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(requests.length / PER_PAGE);
  const paginated  = requests.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Completed Requests</h4>
          <p className="text-muted mb-0 small">All resolved maintenance requests</p>
        </div>
      </div>

      {/* Summary banner */}
      {!loading && requests.length > 0 && (
        <div className="card border-0 shadow-sm bg-success text-white mb-4">
          <div className="card-body d-flex align-items-center gap-3 p-4">
            <div
              className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center"
              style={{ width: 56, height: 56 }}
            >
              <i className="bi bi-check-circle-fill fs-3" />
            </div>
            <div>
              <div className="fs-2 fw-bold">{requests.length}</div>
              <div className="opacity-75">Total Completed Requests</div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-clipboard-check fs-1 d-block mb-2 opacity-50" />
          <p className="fw-semibold">No completed requests yet</p>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {paginated.map((r) => {
              const priority      = PRIORITY_CONFIG[r.priority] || PRIORITY_CONFIG["Standard"];
              const cardImage     = r.photos?.[0]?.url
                || `https://placehold.co/400x180/e9ecef/6c757d?text=${encodeURIComponent(r.priority)}`;
              const ratedInfo     = ratedMap[r._id] || { rated: false, rating: null };
              const hasContractor = !!r.contractorId;

              return (
                <div key={r._id} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100">

                    <img
                      src={cardImage}
                      alt={r.subject}
                      className="card-img-top"
                      style={{ height: 160, objectFit: "cover" }}
                    />

                    <div className="card-body">
                      {/* Badges */}
                      <div className="d-flex gap-2 mb-2 flex-wrap">
                        <span className="badge bg-success">
                          <i className="bi bi-check-circle me-1" />Completed
                        </span>
                        <span className={`badge bg-${priority.badge}`}>
                          <i className={`bi ${priority.icon} me-1`} />{r.priority}
                        </span>
                      </div>

                      {/* Subject */}
                      <h6 className="fw-bold mb-1 text-truncate">{r.subject}</h6>
                      <p className="text-muted mb-2" style={{ fontSize: 12 }}>
                        {r.description?.length > 80
                          ? r.description.substring(0, 80) + "..."
                          : r.description}
                      </p>

                      {/* Resident */}
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <img
                          src={r.residentPhoto || DEFAULT_AVATAR}
                          alt="resident"
                          className="rounded-circle border flex-shrink-0"
                          width={24} height={24}
                          style={{ objectFit: "cover" }}
                        />
                        <span className="text-muted small text-truncate">
                          {r.residentEmail || "—"}
                        </span>
                      </div>

                      {/* Contractor */}
                      {r.contractor && (
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <img
                            src={r.contractor.photo || DEFAULT_AVATAR}
                            alt="contractor"
                            className="rounded-circle border flex-shrink-0"
                            width={24} height={24}
                            style={{ objectFit: "cover" }}
                          />
                          <span className="text-muted small text-truncate">
                            <i className="bi bi-tools me-1 text-warning" />
                            {[r.contractor.firstName, r.contractor.lastName].filter(Boolean).join(" ") || r.contractor.email}
                          </span>
                        </div>
                      )}

                      {/* Completed date */}
                      <div className="text-muted small">
                        <i className="bi bi-calendar-check text-success me-1" />
                        {new Date(r.updatedAt).toLocaleDateString([], {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </div>
                    </div>

                    {/* Footer — Rate button */}
                    <div className="card-footer bg-transparent border-top-0 pb-3 px-3">
                      <RateButton
                        rated={ratedInfo.rated}
                        existingRating={ratedInfo.rating?.rating}
                        disabled={!hasContractor}
                        onClick={() => { setRateRequest(r); setModalError(""); }}
                      />
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

      {/* Rate Contractor Modal */}
      <RateContractorModal
        show={!!rateRequest}
        request={rateRequest}
        saving={saving}
        error={modalError}
        onSave={handleRate}
        onClose={() => { setRateRequest(null); setModalError(""); }}
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
