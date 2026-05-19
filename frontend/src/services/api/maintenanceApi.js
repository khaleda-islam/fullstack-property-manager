import http from "./http";

// Resident
export const createRequest        = (token, data)           => http("/api/maintenance",                       token, { method: "POST",  body: data });
export const getMyRequests        = (token)                  => http("/api/maintenance/my",                   token);
export const deleteRequest        = (token, id)              => http(`/api/maintenance/${id}`,                token, { method: "DELETE" });

// Landlord
export const getPropertyRequests          = (token, propertyId)     => http(`/api/maintenance/property/${propertyId}`,token);
export const getLandlordCompletedRequests = (token)                  => http("/api/maintenance/completed",            token);
export const updateStatus                 = (token, id, status)      => http(`/api/maintenance/${id}/status`,         token, { method: "PATCH", body: { status } });
export const searchContractors    = (token, filters = {})   => {
  const params = new URLSearchParams(filters).toString();
  return http(`/api/maintenance/contractors${params ? `?${params}` : ""}`, token);
};
export const assignContractor     = (token, id, contractorId) => http(`/api/maintenance/${id}/assign`,    token, { method: "PATCH", body: { contractorId } });
export const unassignContractor   = (token, id)               => http(`/api/maintenance/${id}/unassign`,  token, { method: "PATCH" });

// Contractor
export const getAssignedRequests    = (token)                  => http("/api/maintenance/assigned",                  token);
export const getMyJobs              = (token)                  => http("/api/maintenance/my-jobs",                   token);
export const getPastJobs            = (token)                  => http("/api/maintenance/past-jobs",                 token);
export const contractorUpdateStatus = (token, id, status)      => http(`/api/maintenance/${id}/contractor-status`,   token, { method: "PATCH", body: { status } });
export const respondToAssignment    = (token, id, response)    => http(`/api/maintenance/${id}/respond`,             token, { method: "PATCH", body: { response } });
