import http from "./http";

export const getNotifications = (token)     => http("/api/notifications",          token);
export const markRead         = (token, id) => http(`/api/notifications/${id}/read`,token, { method: "PATCH" });
export const markAllRead      = (token)     => http("/api/notifications/read-all",  token, { method: "PATCH" });
