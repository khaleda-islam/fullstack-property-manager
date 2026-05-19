// ── Usage ─────────────────────────────────────────────────────────────────────
//
// <AssignmentSuccessAlert
//   show={showSuccess}
//   residentName="Alice Johnson"
//   propertyName="Maple Residences"
//   onClose={() => setShowSuccess(false)}
// />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

export default function AssignmentSuccessAlert({
  show          = false,
  residentName  = "",
  propertyName  = "",
  onClose       = () => {},
}) {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setTimeout(() => setAnimate(true), 10);
      const timer = setTimeout(() => handleClose(), 5000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position:   "fixed",
        bottom:     24,
        right:      24,
        zIndex:     9999,
        width:      340,
        transform:  animate ? "translateY(0)"    : "translateY(24px)",
        opacity:    animate ? 1                   : 0,
        transition: "transform 0.35s ease, opacity 0.35s ease",
      }}
    >
      <div className="card border-0 shadow-lg overflow-hidden">

        {/* Green top bar */}
        <div style={{ height: 5, background: "#198754" }} />

        <div className="card-body p-3">
          <div className="d-flex align-items-start gap-3">

            {/* Icon */}
            <div
              className="rounded-circle bg-success d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40 }}
            >
              <i className="bi bi-person-check-fill text-white fs-5" />
            </div>

            {/* Content */}
            <div className="flex-grow-1">
              <div className="fw-bold text-success mb-1">Resident Assigned!</div>
              <div className="small text-muted">
                <span className="fw-semibold text-dark">{residentName || "Resident"}</span>
                {" "}has been successfully assigned to{" "}
                <span className="fw-semibold text-dark">{propertyName || "the property"}</span>.
              </div>
            </div>

            {/* Close */}
            <button
              className="btn-close btn-close-sm flex-shrink-0"
              onClick={handleClose}
            />
          </div>

          {/* Progress bar — drains over 5 seconds */}
          <div className="progress mt-3" style={{ height: 3 }}>
            <div
              className="progress-bar bg-success"
              style={{
                width:      animate ? "0%" : "100%",
                transition: animate ? "width 5s linear" : "none",
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
