import { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getRooms, findOrCreateRoom, getMessages } from "../services/api";
import { getSocket } from "../services/socket";
import MessageBubble from "../components/MessageBubble";

const DEFAULT_AVATAR = "https://placehold.co/40x40/cccccc/ffffff?text=?";

function timeAgo(date) {
  if (!date) return "";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  const { getAccessTokenSilently }  = useAuth0();
  const { dbUser }                   = useUser();
  const location                     = useLocation();

  // initialUserId passed via navigate("/messages", { state: { initialUserId } })
  const initialUserId = location.state?.initialUserId || null;

  const [rooms,        setRooms]        = useState([]);
  const [activeRoom,   setActiveRoom]   = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMsgs,  setLoadingMsgs]  = useState(false);
  const [isTyping,     setIsTyping]     = useState(false);

  const bottomRef  = useRef(null);
  const typingRef  = useRef(null);
  const myId       = dbUser?.auth0Id;

  // ── Load rooms ────────────────────────────────────────────────────────────
  const loadRooms = async () => {
    try {
      const token = await getAccessTokenSilently();
      const data  = await getRooms(token);
      setRooms(data);
      return data; // return so callers can use it
    } catch {
      return [];
    } finally {
      setLoadingRooms(false);
    }
  };

  // ── Open or create room with a user ──────────────────────────────────────
  const openChat = async (otherUserId) => {
    try {
      const token = await getAccessTokenSilently();
      const room  = await findOrCreateRoom(token, otherUserId);
      const data  = await loadRooms(); // reload rooms and get fresh list
      const enriched = data.find((r) => r.roomId?.toString() === room._id?.toString());
      setActiveRoom(enriched || { roomId: room._id, otherUser: null });
    } catch {
      // silent
    }
  };

  // ── On mount: load rooms, then open chat if initialUserId present ─────────
  useEffect(() => {
    const init = async () => {
      const data = await loadRooms();
      if (initialUserId && dbUser) {
        // Check if room already exists in list — avoid calling findOrCreateRoom twice
        const token    = await getAccessTokenSilently();
        const room     = await findOrCreateRoom(token, initialUserId);
        const enriched = data.find((r) => r.roomId?.toString() === room._id?.toString());
        setActiveRoom(enriched || { roomId: room._id, otherUser: null });
        // Reload rooms to include the new one if it was just created
        loadRooms();
      }
    };
    init();
  }, []); // only on mount — initialUserId is stable from location.state

  // ── Load messages when room selected ─────────────────────────────────────
  useEffect(() => {
    if (!activeRoom) return;
    const load = async () => {
      setLoadingMsgs(true);
      try {
        const token = await getAccessTokenSilently();
        const socket = getSocket();
        if (socket) socket.emit("open_dm", { roomId: activeRoom.roomId });
        const data = await getMessages(token, activeRoom.roomId);
        setMessages(data);
      } catch {
        // silent
      } finally {
        setLoadingMsgs(false);
      }
    };
    load();
  }, [activeRoom?.roomId]);

  // ── Socket: receive messages + typing ─────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("receive_dm", (msg) => {
      if (msg.roomId?.toString() !== activeRoom?.roomId?.toString()) return;

      if (msg.senderId === myId) {
        // Replace the last optimistic message (temp _id) with the real saved one
        setMessages((prev) => {
          const idx = [...prev].reverse().findIndex(
            (m) => typeof m._id === "number" && m.senderId === myId
          );
          if (idx === -1) return prev;
          const realIdx = prev.length - 1 - idx;
          const updated = [...prev];
          updated[realIdx] = msg;
          return updated;
        });
      } else {
        // Message from other user — just append
        setMessages((prev) => [...prev, msg]);
      }
      loadRooms();
    });

    socket.on("message_deleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id?.toString() === messageId?.toString()
            ? { ...m, message: "This message was deleted", deleted: true }
            : m
        )
      );
    });

    socket.on("user_typing", ({ isTyping: t }) => {
      setIsTyping(t);
    });

    return () => {
      socket.off("receive_dm");
      socket.off("message_deleted");
      socket.off("user_typing");
    };
  }, [activeRoom?.roomId, myId]);

  // ── Auto scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!input.trim() || !activeRoom) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("send_dm", {
      roomId:     activeRoom.roomId,
      message:    input.trim(),
      senderName: dbUser?.name || "User",
    });

    // Optimistic update
    setMessages((prev) => [
      ...prev,
      {
        _id:        Date.now(),
        roomId:     activeRoom.roomId,
        senderId:   dbUser?.auth0Id,
        senderName: dbUser?.name,
        message:    input.trim(),
        createdAt:  new Date(),
        read:       false,
      },
    ]);
    setInput("");
  };

  // ── Delete message via socket ─────────────────────────────────────────────
  const handleDelete = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;
    const socket = getSocket();
    if (!socket || !activeRoom) return;
    socket.emit("delete_dm", { roomId: activeRoom.roomId, messageId });
  };
  const handleTyping = (e) => {
    setInput(e.target.value);
    const socket = getSocket();
    if (!socket || !activeRoom) return;
    socket.emit("typing", { roomId: activeRoom.roomId, isTyping: true, senderName: dbUser?.name });
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => {
      socket.emit("typing", { roomId: activeRoom.roomId, isTyping: false });
    }, 1500);
  };

  return (
    <div className="d-flex" style={{ height: "calc(100vh - 56px)" }}>

      {/* ── Sidebar — room list ─────────────────────────────────────────── */}
      <div
        className="d-flex flex-column bg-white border-end flex-shrink-0"
        style={{ width: 280 }}
      >
        <div className="px-3 py-3 border-bottom">
          <h6 className="fw-bold mb-0">
            <i className="bi bi-chat-dots me-2 text-primary" />Messages
          </h6>
        </div>

        <div className="overflow-y-auto flex-grow-1">
          {loadingRooms ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-5 text-muted px-3">
              <i className="bi bi-chat-square fs-2 d-block mb-2 opacity-50" />
              <small>No conversations yet</small>
            </div>
          ) : (
            rooms.map((r) => {
              const isActive = activeRoom?.roomId === r.roomId;
              return (
                <div
                  key={r.roomId}
                  className={`d-flex align-items-center gap-2 px-3 py-2 border-bottom ${isActive ? "bg-primary bg-opacity-10" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setActiveRoom(r)}
                >
                  <img
                    src={r.otherUser?.picture || DEFAULT_AVATAR}
                    alt={r.otherUser?.name}
                    className="rounded-circle border flex-shrink-0"
                    width={40} height={40}
                    style={{ objectFit: "cover" }}
                  />
                  <div className="flex-grow-1 min-width-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-semibold small text-truncate">{r.otherUser?.name || "User"}</span>
                      <span className="text-muted" style={{ fontSize: 10 }}>
                        {timeAgo(r.lastMessage?.sentAt)}
                      </span>
                    </div>
                    <div className="text-muted text-truncate" style={{ fontSize: 12 }}>
                      {r.lastMessage?.text || "No messages yet"}
                    </div>
                  </div>
                  {r.unread > 0 && (
                    <span className="badge rounded-pill bg-primary flex-shrink-0">{r.unread}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat window ─────────────────────────────────────────────────── */}
      {!activeRoom ? (
        <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light text-muted">
          <div className="text-center">
            <i className="bi bi-chat-dots fs-1 d-block mb-2 opacity-50" />
            <p className="fw-semibold">Select a conversation</p>
            <small>Or start one from the Property or Maintenance pages</small>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column flex-grow-1 bg-light">

          {/* Chat header */}
          <div className="bg-white border-bottom px-4 py-3 d-flex align-items-center gap-3">
            <img
              src={activeRoom.otherUser?.picture || DEFAULT_AVATAR}
              alt={activeRoom.otherUser?.name}
              className="rounded-circle border"
              width={38} height={38}
              style={{ objectFit: "cover" }}
            />
            <div>
              <div className="fw-bold">{activeRoom.otherUser?.name || "User"}</div>
              <div className="text-muted small text-capitalize">{activeRoom.otherUser?.role || ""}</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-grow-1 overflow-y-auto p-4">
            {loadingMsgs ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted py-4">
                <small>No messages yet — say hello!</small>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  msg={msg}
                  isMine={msg.senderId === myId}
                  onDelete={handleDelete}
                />
              ))
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="d-flex justify-content-start mb-2">
                <div className="bg-white border px-3 py-2 rounded-3">
                  <div className="d-flex gap-1 align-items-center">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-top px-4 py-3 d-flex gap-2">
            <input
              className="form-control"
              placeholder="Type a message..."
              value={input}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            />
            <button
              className="btn btn-primary px-3"
              onClick={handleSend}
              disabled={!input.trim()}
            >
              <i className="bi bi-send" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
