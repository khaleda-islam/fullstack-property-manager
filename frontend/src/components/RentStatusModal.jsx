// ── Usage ─────────────────────────────────────────────────────────────────────
//
// <RentStatusModal
//   show={showModal}
//   assignment={assignment}   // { resident: { firstName, lastName, photo }, rentPaid }
//   saving={saving}
//   onSave={(rentPaid) => {}} // called with true or false
//   onClose={() => {}}
// />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

const DEFAULT_AVATAR = "https://placehold.co/48x48/cccccc/ffffff?text=?";

export default function RentStatusModal({
  show       = false,
  assignment = null,
  saving     = false,
  onSave     = () => {},
  onClose    = () => {},
}) {
  const [rentPaid, setRentPaid] = useState(false);

  useEffect(() => {
    if (show && assignment) {
      setRentPaid(assignment.rentPaid ?? false);
    }
  }, [show, assignment]);

  if (!show || !assignment) return null;

  const { resident } = assignment;
  const fullName = [resident?.firstName, resident?.lastName].filter(Boolean).join(" ") || resident?.name || "Resident";

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
        <div className="modal-content border-0 shadow">

          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-cash-coin me-2 text-success" />Edit Rent Status
            </h5>
            <button className="btn-close" onClick={onClose} disabled={saving} />
          </div>

          {/* Body */}
          <div className="modal-body p-4">

            {/* Resident info */}
            <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
              <img
                src={resident?.photo || DEFAULT_AVATAR}
                alt={fullName}
                className="rounded-circle border flex-shrink-0"
                width={48} height={48}
                style={{ objectFit: "cover" }}
              />
              <div>
                <div className="fw-semibold">{fullName}</div>
                <div className="text-muted small">{resident?.email || "—"}</div>
              </div>
            </div>

            {/* Current status */}
            <div className="text-center mb-4">
              <div className="text-muted small mb-2">Current Status</div>
              <span className={`badge fs-6 px-4 py-2 bg-${assignment.rentPaid ? "success" : "danger"}`}>
                <i className={`bi bi-${assignment.rentPaid ? "check-circle" : "x-circle"} me-2`} />
                {assignment.rentPaid ? "Paid" : "Unpaid"}
              </span>
            </div>

            {/* Toggle buttons */}
            <div className="d-grid gap-2">
              <div
                className={`card border-2 p-3 d-flex flex-row align-items-center gap-3 ${rentPaid ? "border-success bg-success bg-opacity-10" : "border"}`}
                style={{ cursor: "pointer" }}
                onClick={() => setRentPaid(true)}
              >
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${rentPaid ? "bg-success" : "bg-light"}`}
                  style={{ width: 36, height: 36 }}
                >
                  <i className={`bi bi-check-circle-fill ${rentPaid ? "text-white" : "text-muted"}`} />
                </div>
                <div>
                  <div className={`fw-semibold ${rentPaid ? "text-success" : "text-muted"}`}>Paid</div>
                  <div className="text-muted small">Rent has been received</div>
                </div>
                {rentPaid && <i className="bi bi-check2 text-success ms-auto fs-5" />}
              </div>

              <div
                className={`card border-2 p-3 d-flex flex-row align-items-center gap-3 ${!rentPaid ? "border-danger bg-danger bg-opacity-10" : "border"}`}
                style={{ cursor: "pointer" }}
                onClick={() => setRentPaid(false)}
              >
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${!rentPaid ? "bg-danger" : "bg-light"}`}
                  style={{ width: 36, height: 36 }}
                >
                  <i className={`bi bi-x-circle-fill ${!rentPaid ? "text-white" : "text-muted"}`} />
                </div>
                <div>
                  <div className={`fw-semibold ${!rentPaid ? "text-danger" : "text-muted"}`}>Unpaid</div>
                  <div className="text-muted small">Rent has not been received</div>
                </div>
                {!rentPaid && <i className="bi bi-check2 text-danger ms-auto fs-5" />}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              className={`btn btn-${rentPaid ? "success" : "danger"}`}
              onClick={() => onSave(rentPaid)}
              disabled={saving}
            >
              {saving
                ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                : <><i className="bi bi-check-lg me-1" />Save Status</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
