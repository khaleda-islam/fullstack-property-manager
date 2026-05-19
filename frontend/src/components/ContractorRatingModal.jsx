// ── Usage ─────────────────────────────────────────────────────────────────────
// <ContractorRatingModal
//   show={showRating}
//   contractor={contractor}
//   onClose={() => {}}
// />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getContractorRatings } from "../services/api";

const DEFAULT_AVATAR = "https://placehold.co/56x56/cccccc/ffffff?text=?";

function StarBar({ rating, max = 10 }) {
  const pct   = (rating / max) * 100;
  const color = rating >= 8 ? "success" : rating >= 5 ? "warning" : "danger";
  return (
    <div className="d-flex align-items-center gap-2">
      <div className="progress flex-grow-1" style={{ height: 8 }}>
        <div className={`progress-bar bg-${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="fw-bold small">{rating.toFixed(1)}/10</span>
    </div>
  );
}

function RatingCircle({ rating }) {
  const color = rating >= 8 ? "#198754" : rating >= 5 ? "#ffc107" : "#dc3545";
  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
      style={{ width: 64, height: 64, background: color }}
    >
      <span className="text-white fw-bold fs-5">{rating.toFixed(1)}</span>
    </div>
  );
}

function timeAgo(date) {
  return new Date(date).toLocaleDateString([], {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default function ContractorRatingModal({
  show       = false,
  contractor = null,
  onClose    = () => {},
}) {
  const { getAccessTokenSilently } = useAuth0();

  const [ratings,  setRatings]  = useState([]);
  const [loading,  setLoading]  = useState(false);

  const fullName = [contractor?.firstName, contractor?.lastName].filter(Boolean).join(" ") || "—";
  const avg      = contractor?.averageRating ?? 0;
  const total    = contractor?.totalRatings  ?? 0;

  // ── Fetch ratings when modal opens ────────────────────────────────────────
  useEffect(() => {
    if (!show || !contractor?.auth0Id) return;

    const load = async () => {
      setLoading(true);
      try {
        const token = await getAccessTokenSilently();
        const data  = await getContractorRatings(token, contractor.auth0Id);
        setRatings(data);
      } catch {
        setRatings([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [show, contractor?.auth0Id]);

  if (!show || !contractor) return null;

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: 520 }}>
        <div className="modal-content border-0 shadow">

          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-star me-2 text-warning" />Rating History
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body p-4">

            {/* Contractor summary */}
            <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
              <img
                src={contractor.photo || DEFAULT_AVATAR}
                alt={fullName}
                className="rounded-circle border flex-shrink-0"
                width={52} height={52}
                style={{ objectFit: "cover" }}
              />
              <div className="flex-grow-1 min-width-0">
                <div className="fw-bold text-truncate">{fullName}</div>
                <div className="text-muted small text-truncate">
                  <i className="bi bi-envelope me-1" />{contractor.email || "—"}
                </div>
                {contractor.jobType && (
                  <span className="badge bg-warning text-dark mt-1">
                    <i className="bi bi-tools me-1" />{contractor.jobType}
                  </span>
                )}
              </div>
            </div>

            {/* Average rating */}
            <div className="card border-0 bg-light rounded-3 mb-4">
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <RatingCircle rating={avg} />
                  <div className="flex-grow-1">
                    <div className="fw-bold mb-1">Average Rating</div>
                    <StarBar rating={avg} />
                    <div className="text-muted small mt-1">
                      Based on {total} review{total !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating list */}
            <div className="fw-semibold small text-uppercase text-muted mb-3">
              <i className="bi bi-clock-history me-1" />Review History
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-warning" />
              </div>
            ) : ratings.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-star fs-1 d-block mb-2 opacity-25" />
                <div className="fw-semibold">No reviews yet</div>
                <div className="small mt-1">
                  Reviews will appear here once landlords rate completed jobs
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {ratings.map((r) => {
                  const color = r.rating >= 8 ? "success" : r.rating >= 5 ? "warning" : "danger";
                  return (
                    <div key={r._id} className="card border-0 bg-light rounded-3">
                      <div className="card-body p-3">

                        {/* Landlord + rating */}
                        <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={r.landlord?.photo || DEFAULT_AVATAR}
                              alt={r.landlord?.name}
                              className="rounded-circle border flex-shrink-0"
                              width={32} height={32}
                              style={{ objectFit: "cover" }}
                            />
                            <div>
                              <div className="fw-semibold small">{r.landlord?.name || "—"}</div>
                              <div className="text-muted" style={{ fontSize: 11 }}>
                                {r.landlord?.email || "—"}
                              </div>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge bg-${color} fs-6 px-2 py-1`}>
                              {r.rating}/10
                            </span>
                            <span className="text-muted" style={{ fontSize: 11 }}>
                              {timeAgo(r.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Star bar */}
                        <StarBar rating={r.rating} />

                        {/* Comment */}
                        {r.comment && (
                          <div
                            className="text-muted small mt-2 p-2 bg-white rounded-3"
                            style={{ lineHeight: 1.6 }}
                          >
                            <i className="bi bi-chat-quote me-1 text-secondary" />
                            {r.comment}
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
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
