// ── Usage ─────────────────────────────────────────────────────────────────────
// <ResidentMessageRoomModal
//   show={showModal}
//   landlord={{ name, email, photo }}
//   onClose={() => {}}
//   onGoToMessages={() => {}}
// />
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_AVATAR = "https://placehold.co/56x56/cccccc/ffffff?text=?";

const FAKE_MESSAGES = [
  {
    id: 1,
    senderId: "landlord",
    text: "Hello! Let me know if you need anything regarding your unit.",
    time: "10:30 AM",
  },
  {
    id: 2,
    senderId: "resident",
    text: "Hi! Yes, I had a question about the parking space.",
    time: "10:32 AM",
  },
  {
    id: 3,
    senderId: "landlord",
    text: "Sure, feel free to ask anytime.",
    time: "10:33 AM",
  },
];

export default function ResidentMessageRoomModal({
  show            = false,
  landlord        = null,
  onClose         = () => {},
  onGoToMessages  = () => {},
}) {
  if (!show || !landlord) return null;

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 480 }}>
        <div className="modal-content border-0 shadow overflow-hidden">

          {/* Header */}
          <div className="modal-header bg-success text-white">
            <div className="d-flex align-items-center gap-3">
              <img
                src={landlord.photo || DEFAULT_AVATAR}
                alt={landlord.name}
                className="rounded-circle border border-white flex-shrink-0"
                width={40} height={40}
                style={{ objectFit: "cover" }}
              />
              <div>
                <div className="fw-bold">{landlord.name || "Landlord"}</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>
                  <i className="bi bi-circle-fill me-1" style={{ fontSize: 8 }} />Online
                </div>
              </div>
            </div>
            <button
              className="btn-close btn-close-white ms-auto"
              onClick={onClose}
            />
          </div>

          {/* Fake message preview */}
          <div
            className="p-3 bg-light"
            style={{ maxHeight: 260, overflowY: "auto" }}
          >
            {FAKE_MESSAGES.map((m) => {
              const isMine = m.senderId === "resident";
              return (
                <div
                  key={m.id}
                  className={`d-flex mb-2 ${isMine ? "justify-content-end" : "justify-content-start"}`}
                >
                  <div
                    className={`px-3 py-2 rounded-3 ${isMine ? "bg-success text-white" : "bg-white border"}`}
                    style={{ maxWidth: "75%", fontSize: 13 }}
                  >
                    <div>{m.text}</div>
                    <div
                      className={`mt-1 ${isMine ? "text-white opacity-75" : "text-muted"}`}
                      style={{ fontSize: 10 }}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="modal-footer flex-column gap-2 bg-white">
            <div className="text-muted small text-center">
              <i className="bi bi-info-circle me-1" />
              This is a preview. Go to Messages to chat.
            </div>
            <div className="d-flex gap-2 w-100">
              <button className="btn btn-outline-secondary flex-grow-1" onClick={onClose}>
                Close
              </button>
              <button className="btn btn-success flex-grow-1" onClick={onGoToMessages}>
                <i className="bi bi-chat-dots me-1" />Go to Messages
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
