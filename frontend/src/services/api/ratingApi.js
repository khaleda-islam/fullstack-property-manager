import http from "./http";

export const createRating          = (token, data)          => http("/api/ratings",                         token, { method: "POST", body: data });
export const getContractorRatings  = (token, contractorId)  => http(`/api/ratings/${contractorId}`,          token);
export const checkRating           = (token, maintenanceId) => http(`/api/ratings/check/${maintenanceId}`,   token);
