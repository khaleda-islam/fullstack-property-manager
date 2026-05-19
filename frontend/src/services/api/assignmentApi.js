import http from "./http";

export const getMyAssignment   = (token)                     => http("/api/assignments/my",              token);
export const getAssignments    = (token, propertyId)         => http(`/api/assignments/${propertyId}`,   token);
export const createAssignment  = (token, propertyId, data)   => http(`/api/assignments/${propertyId}`,   token, { method: "POST",  body: data });
export const updateAssignment  = (token, assignmentId, data) => http(`/api/assignments/${assignmentId}`, token, { method: "PUT",   body: data });
export const deleteAssignment  = (token, assignmentId)       => http(`/api/assignments/${assignmentId}`, token, { method: "DELETE" });
export const updateRentStatus  = (token, assignmentId, rentPaid) => http(`/api/assignments/${assignmentId}/rent`, token, { method: "PATCH", body: { rentPaid } });
