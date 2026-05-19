import http from "./http";

export const getProperties   = (token)              => http("/api/properties",       token);
export const getPropertyById = (token, id)          => http(`/api/properties/${id}`, token);
export const createProperty  = (token, data)        => http("/api/properties",       token, { method: "POST", body: data });
export const updateProperty  = (token, id, data)    => http(`/api/properties/${id}`, token, { method: "PUT",  body: data });
export const deleteProperty  = (token, id)          => http(`/api/properties/${id}`, token, { method: "DELETE" });
