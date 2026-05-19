import http from "./http";

// POST /api/users/sync — called after login to upsert user in our DB
export const syncUser = (token, data) =>
  http("/api/users/sync", token, { method: "POST", body: data });

// GET /api/users/me — get current logged in user profile
export const getMe = (token) =>
  http("/api/users/me", token);