// ── Usage ─────────────────────────────────────────────────────────────────────
// <ProfileSaveAlert
//   type="success"                 // "success" | "danger"
//   message="Profile updated!"
//   show={showAlert}
//   onClose={() => setShowAlert(false)}
// />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

const CONFIG = {
  success: {
    icon:       "bi-check-circle-fill",
    color:      "#198754",
    barColor:   "bg-success",
    bgClass:    "bg-success bg-opacity-10 border-success",
    textClass:  "text-success",
  },
  danger: {
    icon:       "bi-x-circle-fill",
    color:      "#dc3545",
    barColor:   "bg-danger",
    bgClass:    "bg-danger bg-opacity-10 border-danger",
    textClass:  "text-danger",
  },
};

const DURATION = 4000;

export default function ProfileSaveAlert({
  show    = false,
  type    = "success",
  message = "",
  onClose = () => {},
}) {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const cfg = CONFIG[type] || CONFIG.success;

  useEffect(() => {
    if (show && message) {
      setVisible(true);
      setTimeout(() => setAnimate(true), 10);
      const timer = setTimeout(() => handleClose(), DURATION);
      return () => clearTimeout(timer);
    }
  }, [show, message]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => { setVisible(false); onClose(); }, 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`border rounded-3 px-3 py-2 d-flex align-items-center gap-3 mb-3 ${cfg.bgClass}`}
      style={{
        opacity:    animate ? 1 : 0,
        transform:  animate ? "translateY(0)" : "translateY(-8px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      <i className={`bi ${cfg.icon} ${cfg.textClass} fs-5 flex-shrink-0`} />
      <span className={`fw-semibold small flex-grow-1 ${cfg.textClass}`}>{message}</span>
      <button className="btn-close btn-close-sm flex-shrink-0" onClick={handleClose} />
    </div>
  );
}
