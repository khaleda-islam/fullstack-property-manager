// ── Usage ─────────────────────────────────────────────────────────────────────
// <MessageBubble
//   msg={msg}
//   isMine={msg.senderId === myId}
//   onDelete={(id) => {}}
// />
// ─────────────────────────────────────────────────────────────────────────────

function timeAgo(date) {
  if (!date) return "";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function MessageBubble({ msg, isMine = false, onDelete = () => {} }) {
  const isDeleted = msg.deleted;

  return (
    <div
      className={`d-flex mb-3 align-items-end gap-1 ${isMine ? "justify-content-end" : "justify-content-start"}`}
    >
      {/* Delete button — only for own non-deleted messages */}
      {isMine && !isDeleted && (
        <button
          className="btn btn-link p-0 text-muted"
          style={{ fontSize: 11, opacity: 0.5 }}
          title="Delete message"
          onClick={() => onDelete(msg._id)}
        >
          <i className="bi bi-trash" />
        </button>
      )}

      {/* Bubble */}
      <div
        className={`px-3 py-2 rounded-3 ${
          isDeleted
            ? "bg-light border text-muted fst-italic"
            : isMine
            ? "bg-primary text-white"
            : "bg-white border"
        }`}
        style={{ maxWidth: "70%", wordBreak: "break-word" }}
      >
        {/* Text */}
        <div style={{ fontSize: 14 }}>
          {isDeleted && (
            <i className="bi bi-slash-circle me-1" style={{ fontSize: 11 }} />
          )}
          {msg.message}
        </div>

        {/* Timestamp + read receipt */}
        {!isDeleted && (
          <div
            className={`mt-1 ${isMine ? "text-white opacity-75" : "text-muted"}`}
            style={{ fontSize: 10 }}
          >
            {timeAgo(msg.createdAt)}
            {isMine && (
              <i
                className={`bi ${msg.read ? "bi-check2-all" : "bi-check2"} ms-1`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
