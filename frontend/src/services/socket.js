import { io } from "socket.io-client";

// In dev: connect to localhost:3000
// In production: connect to same origin (window.location.origin)
const SERVER_URL = import.meta.env.VITE_SERVER_URL || window.location.origin;

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SERVER_URL, {
    auth:       { token },
    transports: ["websocket", "polling"],
    reconnection:         true,
    reconnectionAttempts: 5,
    reconnectionDelay:    1000,
  });

  return socket;
};

export const getSocket        = () => socket;
export const disconnectSocket = () => { socket?.disconnect(); socket = null; };
