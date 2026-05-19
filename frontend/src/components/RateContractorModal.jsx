// ── Usage ─────────────────────────────────────────────────────────────────────
// <RateContractorModal
//   show={showRating}
//   request={request}       // maintenance request with contractor info
//   saving={saving}
//   error={error}
//   onSave={(rating, comment) => {}}
//   onClose={() => {}}
// />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

const DEFAULT_AVATAR = "https://placehold.co/48x48/cccccc/ffffff?text=?";

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(null);

  return (
    <div className="d-flex gap-1 flex-wrap">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
        <i
          key={star}
          className={`bi ${(hover ?? value) >= star ? "bi-star-fill text-warning" : "bi-star text-muted"}`}
          style={{ fontSize: 28, cursor: "pointer" }}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  );
}

function RatingLabel({ value }) {
  if (!value) return <span className="text-muted small">Click a star to rate</span>;
  const color = value >= 8 ? "text-success" : value >= 5 ? "text-warning" : "text-danger";
  const label = value >= 9 ? "Excellent!" : value >= 7 ? "Good" : value >= 5 ? "Average" : value >= 3 ? "Below Average" : "Poor";
  return <span className={`fw-bold small ${color}`}>{value}/10 — {label}</span>;
}

export default function RateContractorModal({
  show    = false,
  request = null,
  saving  = false,
  error   = "",
  onSave  = () => {},
  onClose = () => {},
}) {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (show) { setRating(0); setComment(""); }
  }, [show]);

  if (!show || !request) return null;

  const contractor = request.contractor;

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 480 }}>
        <div className="modal-content border-0 shadow">

          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-star me-2 text-warning" />Rate Contractor
            </h5>
            <button className="btn-close" onClick={onClose} disabled={saving} />
          </div>

          <div className="modal-body p-4">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                <i className="bi bi-x-circle-fill flex-shrink-0" />
                <span className="small">{error}</span>
              </div>
            )}

            {/* Contractor info */}
            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 mb-4">
              <img
                src={contractor?.photo || DEFAULT_AVATAR}
                alt={contractor?.firstName}
                className="rounded-circle border flex-shrink-0"
                width={52} height={52}
                style={{ objectFit: "cover" }}
              />
              <div>
                <div className="fw-bold">
                  {[contractor?.firstName, contractor?.lastName].filter(Boolean).join(" ") || "Contractor"}
                </div>
                <div className="text-muted small">
                  <i className="bi bi-envelope me-1" />{contractor?.email || "—"}
                </div>
                {contractor?.jobType && (
                  <span className="badge bg-warning text-dark mt-1">
                    <i className="bi bi-tools me-1" />{contractor.jobType}
                  </span>
                )}
              </div>
            </div>

            {/* Job reference */}
            <div className="text-muted small mb-3">
              <i className="bi bi-tools me-1" />Rating for:
              <span className="fw-semibold text-dark ms-1">{request.subject}</span>
            </div>

            {/* Star rating */}
            <div className="mb-2">
              <label className="form-label fw-semibold">
                Rating <span className="text-danger">*</span>
              </label>
              <StarRating value={rating} onChange={setRating} />
              <div className="mt-2">
                <RatingLabel value={rating} />
              </div>
            </div>

            {/* Comment */}
            <div className="mb-0 mt-3">
              <label className="form-label fw-semibold">
                Comment <span className="text-muted fw-normal">(optional)</span>
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Describe the contractor's work quality, professionalism, timeliness..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                disabled={saving}
              />
              <div className="text-muted small mt-1">{comment.length}/500</div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              className="btn btn-warning"
              onClick={() => onSave(rating, comment)}
              disabled={saving || rating === 0}
            >
              {saving
                ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
                : <><i className="bi bi-star me-1" />Submit Rating</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
