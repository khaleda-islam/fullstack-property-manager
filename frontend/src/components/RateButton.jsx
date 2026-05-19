// ── Usage ─────────────────────────────────────────────────────────────────────
// <RateButton
//   rated={isRated}           // bool — already rated
//   existingRating={5}        // number — show existing score if rated
//   onClick={() => {}}        // open rate modal
//   disabled={false}          // e.g. no contractor assigned
// />
// ─────────────────────────────────────────────────────────────────────────────

export default function RateButton({
  rated          = false,
  existingRating = null,
  onClick        = () => {},
  disabled       = false,
}) {
  if (rated) {
    const color = existingRating >= 8 ? "success" : existingRating >= 5 ? "warning" : "danger";
    return (
      <button className={`btn btn-${color} btn-sm w-100`} disabled>
        <i className="bi bi-star-fill me-1" />
        Rated {existingRating}/10
      </button>
    );
  }

  return (
    <button
      className="btn btn-outline-warning btn-sm w-100"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "No contractor assigned" : "Rate this contractor"}
    >
      <i className="bi bi-star me-1" />
      {disabled ? "No Contractor" : "Rate Contractor"}
    </button>
  );
}
