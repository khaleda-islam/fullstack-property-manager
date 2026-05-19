import http from "./http";

export const getProfile         = (token)        => http("/api/profile",        token);
export const updateProfile      = (token, data)  => http("/api/profile",        token, { method: "PUT", body: data });
export const deleteProfilePhoto = (token)        => http("/api/profile/photo",  token, { method: "DELETE" });
