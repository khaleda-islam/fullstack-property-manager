import { useState, useEffect } from "react";

// ── Usage ─────────────────────────────────────────────────────────────────────
//
// <Toast type="success" message="Profile updated!" show={showToast} onClose={() => setShowToast(false)} />
// <Toast type="danger"  message="Something went wrong." show={showToast} onClose={() => setShowToast(false)} />
//
// Props:
//   show      — bool, controls visibility
//   type      — "success" | "danger" | "warning" | "info"
//   message   — string
//   duration  — ms before auto close (default 3500)
//   onClose   — callback when dismissed
// ─────────────────────────────────────────────────────────────────────────────

const ICONS = {
  success: "bi-check-circle-fill",
  danger:  "bi-x-circle-fill",
  warning: "bi-exclamation-triangle-fill",
  info:    "bi-info-circle-fill",
};

const COLORS = {
  success: "#198754",
  danger:  "#dc3545",
  warning: "#ffc107",
  info:    "#0dcaf0",
};

export default function Toast({
  show     = false,
  type     = "success",
  message  = "",
  duration = 3500,
  onClose  = () => {},
}) {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (show && message) {
      setVisible(true);
      // slight delay for enter animation
      setTimeout(() => setAnimate(true), 10);

      const timer = setTimeout(() => handleClose(), duration);
      return () => clearTimeout(timer);
    }
  }, [show, message]);

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
        minWidth:   280,
        maxWidth:   360,
        transform:  animate ? "translateY(0)"   : "translateY(20px)",
        opacity:    animate ? 1                  : 0,
        transition: "transform 0.3s ease, opacity 0.3s ease",
      }}
    >
      <div className="card border-0 shadow-lg overflow-hidden">
        {/* Colored top border */}
        <div style={{ height: 4, background: COLORS[type] }} />

        <div className="card-body d-flex align-items-center gap-3 py-3 px-3">
          <i
            className={`bi ${ICONS[type]} fs-5 flex-shrink-0`}
            style={{ color: COLORS[type] }}
          />
          <span className="flex-grow-1 small fw-semibold">{message}</span>
          <button
            className="btn-close btn-close-sm flex-shrink-0"
            onClick={handleClose}
          />
        </div>
      </div>
    </div>
  );
}
