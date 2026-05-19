import http from "./http";

// GET /api/rooms — get all DM conversations for current user
export const getRooms = (token) =>
  http("/api/rooms", token);

// POST /api/rooms — find or create a DM room with another user
export const findOrCreateRoom = (token, otherUserId) =>
  http("/api/rooms", token, { method: "POST", body: { otherUserId } });

// GET /api/rooms/:roomId — get a single room by its ID
export const getRoomById = (token, roomId) =>
  http(`/api/rooms/${roomId}`, token);
