// ── Usage ─────────────────────────────────────────────────────────────────────
// <AcceptDeclineButtons
//   id={request._id}
//   responding={responding}
//   onAccept={handleAccept}
//   onDecline={handleDecline}
//   size="sm"              // optional — "sm" | "" (default "sm")
//   showLabels={true}      // optional — show text labels (default true)
// />
// ─────────────────────────────────────────────────────────────────────────────

export default function AcceptDeclineButtons({
  id           = "",
  responding   = false,
  onAccept     = () => {},
  onDecline    = () => {},
  size         = "sm",
  showLabels   = true,
}) {
  const btnSize = size ? `btn-${size}` : "";

  return (
    <div className="d-flex gap-2">
      <button
        className={`btn btn-success ${btnSize} flex-grow-1`}
        onClick={() => onAccept(id)}
        disabled={responding}
      >
        {responding
          ? <span className="spinner-border spinner-border-sm" />
          : <><i className="bi bi-check-circle me-1" />{showLabels && "Accept"}</>
        }
      </button>
      <button
        className={`btn btn-outline-danger ${btnSize} flex-grow-1`}
        onClick={() => onDecline(id)}
        disabled={responding}
      >
        {responding
          ? <span className="spinner-border spinner-border-sm" />
          : <><i className="bi bi-x-circle me-1" />{showLabels && "Decline"}</>
        }
      </button>
    </div>
  );
}
