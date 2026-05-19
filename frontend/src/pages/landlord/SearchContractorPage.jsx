import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { searchContractors, assignContractor } from "../../services/api";
import ContractorFilter, { DEFAULT_FILTERS } from "../../components/ContractorFilter";
import ContractorRatingModal from "../../components/ContractorRatingModal";
import Toast from "../../components/Toast";

const DEFAULT_AVATAR = "https://placehold.co/56x56/cccccc/ffffff?text=?";

function StarBar({ rating }) {
  const pct   = (rating / 10) * 100;
  const color = rating >= 8 ? "success" : rating >= 5 ? "warning" : "danger";
  return (
    <div className="d-flex align-items-center gap-2">
      <div className="progress flex-grow-1" style={{ height: 6 }}>
        <div className={`progress-bar bg-${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="small fw-bold text-muted">{rating.toFixed(1)}/10</span>
    </div>
  );
}

export default function SearchContractorPage({ request, onBack, onAssigned }) {
  const { getAccessTokenSilently } = useAuth0();

  const [contractors,  setContractors]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [assigning,    setAssigning]    = useState(null);
  const [filters,      setFilters]      = useState(DEFAULT_FILTERS);
  const [ratingModal,  setRatingModal]  = useState(null); // contractor object
  const [toast,        setToast]        = useState({ show: false, type: "success", message: "" });

  const showToast = (type, message) => setToast({ show: true, type, message });

  // ── Load contractors ──────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const token   = await getAccessTokenSilently();
      const params  = {};
      if (filters.jobType)                    params.jobType   = filters.jobType;
      if (filters.city)                       params.city      = filters.city;
      if (filters.ratingRange.min > 0)        params.minRating = filters.ratingRange.min;
      if (filters.ratingRange.max < 10)       params.maxRating = filters.ratingRange.max;

      const data = await searchContractors(token, params);
      setContractors(data);
    } catch {
      showToast("danger", "Failed to load contractors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Assign contractor ─────────────────────────────────────────────────────
  const handleAssign = async (contractor) => {
    const name = [contractor.firstName, contractor.lastName].filter(Boolean).join(" ") || contractor.email;
    if (!window.confirm(`Assign ${name} to this request?`)) return;
    setAssigning(contractor.auth0Id);
    try {
      const token = await getAccessTokenSilently();
      await assignContractor(token, request._id, contractor.auth0Id);
      showToast("success", `Contractor assigned! Status set to Pending.`);
      setTimeout(() => onAssigned(), 1500);
    } catch {
      showToast("danger", "Failed to assign contractor.");
    } finally {
      setAssigning(null);
    }
  };

  const fullName = (c) =>
    [c.firstName, c.lastName].filter(Boolean).join(" ") || "—";

  return (
    <div className="p-4">

      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>
          <i className="bi bi-arrow-left me-1" />Back
        </button>
        <div className="flex-grow-1">
          <h4 className="fw-bold mb-0">Search Contractor</h4>
          <p className="text-muted small mb-0">
            <i className="bi bi-tools me-1" />
            Assigning to: <strong>{request.subject}</strong>
          </p>
        </div>
      </div>

      {/* Filter component */}
      <ContractorFilter
        filters={filters}
        onChange={setFilters}
        onSearch={load}
        loading={loading}
      />

      {/* Results */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : contractors.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-person-x fs-1 d-block mb-2 opacity-50" />
          <p className="fw-semibold">No contractors found</p>
          <small>Try adjusting your filters</small>
        </div>
      ) : (
        <>
          <div className="text-muted small mb-3">
            <i className="bi bi-people me-1" />
            {contractors.length} contractor{contractors.length !== 1 ? "s" : ""} found
          </div>

          <div className="row g-3">
            {contractors.map((c) => (
              <div key={c.auth0Id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-3">

                    {/* Photo + name row */}
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <img
                        src={c.photo || DEFAULT_AVATAR}
                        alt={fullName(c)}
                        className="rounded-circle border flex-shrink-0"
                        width={56} height={56}
                        style={{ objectFit: "cover" }}
                      />
                      <div className="fw-bold">{fullName(c)}</div>
                    </div>

                    {/* Job type */}
                    {c.jobType && (
                      <div className="mb-1">
                        <span className="badge bg-warning text-dark">
                          <i className="bi bi-tools me-1" />{c.jobType}
                        </span>
                      </div>
                    )}

                    {/* Email — profile email preferred */}
                    <div className="text-muted small text-truncate mb-2">
                      <i className="bi bi-envelope me-1" />{c.profileEmail || c.email || "—"}
                    </div>

                    {/* Location */}
                    <div className="text-muted small mb-2">
                      <i className="bi bi-geo-alt me-1" />
                      {[c.city, c.state].filter(Boolean).join(", ") || "Location not set"}
                    </div>

                    {/* Rating */}
                    <div className="mb-3">
                      <div className="text-muted small mb-1">
                        <i className="bi bi-star me-1" />Rating
                        <span className="text-muted ms-1">
                          ({c.totalRatings} review{c.totalRatings !== 1 ? "s" : ""})
                        </span>
                      </div>
                      <StarBar rating={c.averageRating} />
                    </div>

                  </div>

                  <div className="card-footer bg-transparent border-top-0 px-3 pb-3 d-flex gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm flex-grow-1"
                      onClick={() => setRatingModal(c)}
                    >
                      <i className="bi bi-star me-1" />Ratings
                    </button>
                    <button
                      className="btn btn-success btn-sm flex-grow-1"
                      onClick={() => handleAssign(c)}
                      disabled={assigning === c.auth0Id}
                    >
                      {assigning === c.auth0Id
                        ? <><span className="spinner-border spinner-border-sm me-2" />Assigning...</>
                        : <><i className="bi bi-person-check me-1" />Assign</>}
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ContractorRatingModal
        show={!!ratingModal}
        contractor={ratingModal}
        onClose={() => setRatingModal(null)}
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
