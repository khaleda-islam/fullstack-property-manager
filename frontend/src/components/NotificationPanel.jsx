import { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getNotifications, markRead, markAllRead } from "../services/api";
import { getSocket } from "../services/socket";

const TYPE_CONFIG = {
  "maintenance_status":  { color: "success",  icon: "bi-tools"         },
  "contractor_assigned": { color: "warning",  icon: "bi-person-check"  },
  "contractor_response": { color: "primary",  icon: "bi-reply"         },
};

function getConfig(n) {
  if (TYPE_CONFIG[n.type]) return TYPE_CONFIG[n.type];
  // fallback: use status from data
  const statusColors = { "Submitted": "secondary", "In Progress": "warning", "Completed": "success" };
  return { color: statusColors[n.data?.status] || "secondary", icon: "bi-bell" };
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function NotificationPanel() {
  const { getAccessTokenSilently } = useAuth0();

  const [notifications, setNotifications] = useState([]);
  const [open,          setOpen]          = useState(false);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Load from API ─────────────────────────────────────────────────────────
  const load = async () => {
    try {
      const token = await getAccessTokenSilently();
      const data  = await getNotifications(token);
      setNotifications(data);
    } catch {
      // silent fail
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ── Socket listener — retry until socket is available ────────────────────
  useEffect(() => {
    let interval;
    let registered = false;

    const register = () => {
      const socket = getSocket();
      if (socket && !registered) {
        registered = true;
        socket.on("notification", (notification) => {
          setNotifications((prev) => [notification, ...prev]);
        });
        clearInterval(interval);
      }
    };

    // Try immediately, then retry every 500ms until socket is available
    register();
    interval = setInterval(register, 500);

    return () => {
      clearInterval(interval);
      const socket = getSocket();
      if (socket) socket.off("notification");
    };
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Mark one as read ──────────────────────────────────────────────────────
  const handleMarkRead = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      await markRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => n._id === id ? { ...n, read: true } : n)
      );
    } catch {
      // silent fail
    }
  };

  // ── Mark all as read ──────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      const token = await getAccessTokenSilently();
      await markAllRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent fail
    }
  };

  return (
    <div className="position-relative" ref={panelRef}>

      {/* Bell button */}
      <button
        className={`d-flex align-items-center gap-2 w-100 px-3 py-2 border-0 text-start fw-medium bg-transparent ${open ? "text-success" : "text-muted"}`}
        style={{ fontSize: 14 }}
        onClick={() => {
          const opening = !open;
          setOpen(opening);
          if (opening) load(); // ← reload from API every time panel opens
        }}
      >
        <div className="position-relative">
          <i className="bi bi-bell" />
          {unreadCount > 0 && (
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style={{ fontSize: 9, padding: "2px 5px" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        Notifications
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="position-absolute bg-white border rounded-3 shadow-lg"
          style={{
            left:          "100%",
            top:           0,
            width:         320,
            maxHeight:     420,
            zIndex:        1000,
            marginLeft:    8,
            display:       "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
            <span className="fw-bold small">
              Notifications
              {unreadCount > 0 && (
                <span className="badge bg-danger ms-2">{unreadCount}</span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                className="btn btn-link btn-sm p-0 text-muted text-decoration-none"
                style={{ fontSize: 11 }}
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-grow-1">
            {notifications.length === 0 ? (
              <div className="text-center text-muted py-4">
                <i className="bi bi-bell-slash fs-2 d-block mb-2 opacity-50" />
                <small>No notifications yet</small>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = getConfig(n);
                return (
                  <div
                    key={n._id}
                    className={`px-3 py-2 border-bottom ${!n.read ? "bg-success bg-opacity-10" : ""}`}
                    style={{ cursor: n.read ? "default" : "pointer" }}
                    onClick={() => !n.read && handleMarkRead(n._id)}
                  >
                    <div className="d-flex align-items-start gap-2">
                      <div
                        className={`rounded-circle bg-${cfg.color} d-flex align-items-center justify-content-center flex-shrink-0 mt-1`}
                        style={{ width: 28, height: 28 }}
                      >
                        <i className={`bi ${cfg.icon} text-white`} style={{ fontSize: 12 }} />
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <div className="fw-semibold" style={{ fontSize: 12 }}>{n.title}</div>
                        <div className="text-muted" style={{ fontSize: 11 }}>{n.message}</div>
                        <div className="text-muted mt-1" style={{ fontSize: 10 }}>
                          {timeAgo(n.createdAt)}
                        </div>
                      </div>
                      {!n.read && (
                        <div
                          className="rounded-circle bg-success flex-shrink-0 mt-2"
                          style={{ width: 8, height: 8 }}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}
    </div>
  );
}
