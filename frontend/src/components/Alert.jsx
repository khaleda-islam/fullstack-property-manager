import { useState, useEffect } from "react";

// ── Usage examples ────────────────────────────────────────────────────────────
//
// <Alert type="success" message="Property saved!" />
// <Alert type="danger"  message="Something went wrong." />
// <Alert type="warning" message="Please fill all fields." />
// <Alert type="info"    message="Loading your data..." />
//
// With auto-dismiss after 4 seconds:
// <Alert type="success" message="Done!" autoDismiss />
//
// With dismiss button:
// <Alert type="danger" message="Error!" dismissible />
//
// ─────────────────────────────────────────────────────────────────────────────

const ICONS = {
  success: "bi-check-circle-fill",
  danger:  "bi-x-circle-fill",
  warning: "bi-exclamation-triangle-fill",
  info:    "bi-info-circle-fill",
};

export default function Alert({
  type        = "info",     // success | danger | warning | info
  message     = "",         // alert text
  dismissible = false,      // show X button
  autoDismiss = false,      // auto hide after duration
  duration    = 4000,       // ms before auto dismiss
  onDismiss   = null,       // callback when dismissed
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true); // reset when message changes
  }, [message]);

  useEffect(() => {
    if (!autoDismiss || !visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [autoDismiss, visible, duration, message]);

  if (!visible || !message) return null;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div className={`alert alert-${type} d-flex align-items-center gap-2 py-2 px-3`} role="alert">
      <i className={`bi ${ICONS[type]} flex-shrink-0`} />
      <span className="flex-grow-1 small">{message}</span>
      {dismissible && (
        <button
          type="button"
          className="btn-close btn-close-sm ms-auto"
          onClick={handleDismiss}
        />
      )}
    </div>
  );
}
