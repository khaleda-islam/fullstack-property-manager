import http from "./http";

export const getMessages   = (token, roomId)    => http(`/api/messages/${roomId}`,    token);
export const deleteMessage = (token, messageId) => http(`/api/messages/${messageId}`, token, { method: "DELETE" });
