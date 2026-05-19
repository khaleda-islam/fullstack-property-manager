// frontend/src/pages/resident/MaintenanceStatusPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getMyRequests } from "../../services/api/maintenanceApi";


const STATUS_CONFIG = {
  "Submitted":   { badge: "secondary", icon: "bi-clock", label: "Submitted", progress: 25 },
  "In Progress": { badge: "warning",   icon: "bi-arrow-repeat", label: "In Progress", progress: 50 },
  "Completed":   { badge: "success",   icon: "bi-check-circle", label: "Completed", progress: 100 },
};

const PRIORITY_CONFIG = {
  "Standard":  { badge: "info",    icon: "bi-flag", label: "Standard", order: 1 },
  "Urgent":    { badge: "warning", icon: "bi-flag-fill", label: "Urgent", order: 2 },
  "Emergency": { badge: "danger",  icon: "bi-exclamation-triangle-fill", label: "Emergency", order: 3 },
};

const ITEMS_PER_PAGE = 5;

export default function MaintenanceStatusPage() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const token = await getAccessTokenSilently();
      const response = await getMyRequests(token);
      
      // Handle response format
      const data = Array.isArray(response) ? response : response.data || [];
      
      const formattedRequests = data.map(req => ({
        id: req._id || req.id,
        subject: req.subject,
        description: req.description,
        priority: req.priority,
        status: req.status,
        submittedDate: req.createdAt,
        lastUpdated: req.updatedAt,
        assignedTo: req.assignedTo,
        estimatedCompletion: req.estimatedCompletion,
        completedDate: req.completedAt,
        property: req.property || { name: "Unknown", unit: "", address: "" },
        photos: req.photos || [],
        updates: req.updates || [
          { date: req.createdAt, message: "Request submitted", status: "Submitted" }
        ]
      }));
      
      setRequests(formattedRequests);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.response?.data?.error || "Failed to load your maintenance requests");
    } finally {
      setIsLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (isAuthenticated) {
      loadRequests();
    }
  }, [isAuthenticated, loadRequests]);

  useEffect(() => {
    let filtered = [...requests];
    if (statusFilter !== "all") {
      filtered = filtered.filter(req => req.status === statusFilter);
    }
    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [requests, statusFilter]);

  const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG["Submitted"];
  const getPriorityConfig = (priority) => PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["Standard"];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Completed": return "text-success";
      case "In Progress": return "text-warning";
      default: return "text-secondary";
    }
  };

  // Statistics
  const stats = {
    total: requests.length,
    submitted: requests.filter(r => r.status === "Submitted").length,
    inProgress: requests.filter(r => r.status === "In Progress").length,
    completed: requests.filter(r => r.status === "Completed").length
  };

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: "400px" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading your maintenance requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger shadow-sm" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill fs-3 me-3"></i>
            <div>
              <h5 className="alert-heading mb-1">Unable to Load Requests</h5>
              <p className="mb-0">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div>
          <h1 className="fw-bold mb-1">
            <i className="bi bi-clipboard-check me-2 text-primary"></i>
            Maintenance Status
          </h1>
          <p className="text-muted mb-0">Track and monitor your maintenance requests</p>
        </div>
        <button className="btn btn-primary mt-3 mt-md-0">
          <i className="bi bi-plus-circle me-1"></i>Submit New Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 bg-primary bg-opacity-10 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-inbox fs-2 text-primary"></i>
              <h2 className="fw-bold mb-0 mt-2">{stats.total}</h2>
              <p className="text-muted small mb-0">Total Requests</p>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 bg-secondary bg-opacity-10 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-clock fs-2 text-secondary"></i>
              <h2 className="fw-bold mb-0 mt-2">{stats.submitted}</h2>
              <p className="text-muted small mb-0">Submitted</p>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 bg-warning bg-opacity-10 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-arrow-repeat fs-2 text-warning"></i>
              <h2 className="fw-bold mb-0 mt-2">{stats.inProgress}</h2>
              <p className="text-muted small mb-0">In Progress</p>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 bg-success bg-opacity-10 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-check-circle fs-2 text-success"></i>
              <h2 className="fw-bold mb-0 mt-2">{stats.completed}</h2>
              <p className="text-muted small mb-0">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          className={`btn ${statusFilter === "all" ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={() => setStatusFilter("all")}
        >
          <i className="bi bi-grid-3x3-gap-fill me-1"></i>All
        </button>
        <button
          className={`btn ${statusFilter === "Submitted" ? "btn-secondary" : "btn-outline-secondary"}`}
          onClick={() => setStatusFilter("Submitted")}
        >
          <i className="bi bi-clock me-1"></i>Submitted
        </button>
        <button
          className={`btn ${statusFilter === "In Progress" ? "btn-warning" : "btn-outline-secondary"}`}
          onClick={() => setStatusFilter("In Progress")}
        >
          <i className="bi bi-arrow-repeat me-1"></i>In Progress
        </button>
        <button
          className={`btn ${statusFilter === "Completed" ? "btn-success" : "btn-outline-secondary"}`}
          onClick={() => setStatusFilter("Completed")}
        >
          <i className="bi bi-check-circle me-1"></i>Completed
        </button>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox display-1 text-muted"></i>
          <h4 className="mt-3">No Maintenance Requests</h4>
          <p className="text-muted">You haven't submitted any {statusFilter !== "all" ? statusFilter.toLowerCase() : ""} requests yet.</p>
          <button className="btn btn-primary mt-2">
            <i className="bi bi-plus-circle me-1"></i>Submit Your First Request
          </button>
        </div>
      ) : (
        <>
          <div className="row g-3">
            {paginatedRequests.map((request) => {
              const status = getStatusConfig(request.status);
              const priority = getPriorityConfig(request.priority);
              
              return (
                <div key={request.id} className="col-12">
                  <div className="card shadow-sm border-0">
                    <div className="card-body p-3 p-md-4">
                      <div className="row align-items-start g-3">
                        {/* Status Icon */}
                        <div className="col-auto">
                          <div className="text-center p-3 rounded-3 bg-light" style={{ minWidth: "80px" }}>
                            <i className={`${status.icon} fs-1 ${getStatusColor(request.status)}`}></i>
                            <div className="small fw-semibold mt-1">{status.label}</div>
                          </div>
                        </div>
                        
                        {/* Request Details */}
                        <div className="col">
                          <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                            <div>
                              <h5 className="fw-bold mb-1">{request.subject}</h5>
                              <p className="text-muted small mb-2">{request.description?.substring(0, 100)}...</p>
                            </div>
                            <span className={`badge bg-${priority.badge} px-3 py-2 fs-6`}>
                              <i className={`bi ${priority.icon} me-1`}></i>
                              {priority.label}
                            </span>
                          </div>
                          
                          <div className="row g-2 mt-2">
                            <div className="col-md-4">
                              <div className="text-muted small">
                                <i className="bi bi-building me-1"></i>
                                {request.property?.name || "Unknown"} {request.property?.unit && `(Unit ${request.property.unit})`}
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="text-muted small">
                                <i className="bi bi-calendar me-1"></i>
                                Submitted: {formatDate(request.submittedDate)}
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="text-muted small">
                                <i className="bi bi-clock-history me-1"></i>
                                Last updated: {formatDate(request.lastUpdated)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="d-flex justify-content-between small text-muted mb-1">
                              <span>Submitted</span>
                              <span>In Progress</span>
                              <span>Completed</span>
                            </div>
                            <div className="progress" style={{ height: "6px" }}>
                              <div 
                                className={`progress-bar ${request.status === "Completed" ? "bg-success" : request.status === "In Progress" ? "bg-warning" : "bg-secondary"}`}
                                style={{ width: `${status.progress}%` }}
                                role="progressbar"
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <div className="col-auto">
                          <button
                            className="btn btn-outline-primary btn-sm rounded-pill px-3"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <i className="bi bi-eye me-1"></i>View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="d-flex justify-content-center mt-4">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      {/* Detailed Modal */}
      {selectedRequest && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setSelectedRequest(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-clipboard-check me-2"></i>
                  Maintenance Request Details
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedRequest(null)}></button>
              </div>
              <div className="modal-body p-4">
                {/* Status Badges */}
                <div className="d-flex flex-wrap gap-2 mb-4">
                  <span className={`badge bg-${getStatusConfig(selectedRequest.status).badge} fs-6 px-3 py-2`}>
                    <i className={`bi ${getStatusConfig(selectedRequest.status).icon} me-1`}></i>
                    {selectedRequest.status}
                  </span>
                  <span className={`badge bg-${getPriorityConfig(selectedRequest.priority).badge} fs-6 px-3 py-2`}>
                    <i className={`bi ${getPriorityConfig(selectedRequest.priority).icon} me-1`}></i>
                    {selectedRequest.priority}
                  </span>
                </div>

                {/* Subject & Description */}
                <div className="card bg-light border-0 rounded-3 mb-3">
                  <div className="card-body">
                    <div className="text-muted small text-uppercase fw-semibold mb-1">Subject</div>
                    <div className="fw-bold fs-5 mb-3">{selectedRequest.subject}</div>
                    <div className="text-muted small text-uppercase fw-semibold mb-1">Description</div>
                    <p className="mb-0">{selectedRequest.description}</p>
                  </div>
                </div>

                {/* Property Information */}
                <div className="card bg-light border-0 rounded-3 mb-3">
                  <div className="card-body">
                    <div className="text-muted small text-uppercase fw-semibold mb-2">
                      <i className="bi bi-geo-alt me-1"></i>Property Location
                    </div>
                    <div className="fw-semibold">{selectedRequest.property?.name || "Unknown"}</div>
                    <div className="text-muted small">{selectedRequest.property?.address || ""}</div>
                  </div>
                </div>

                {/* Assigned Contractor */}
                {selectedRequest.assignedTo && (
                  <div className="card bg-light border-0 rounded-3 mb-3">
                    <div className="card-body">
                      <div className="text-muted small text-uppercase fw-semibold mb-2">
                        <i className="bi bi-person-badge me-1"></i>Assigned Contractor
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                          <i className="bi bi-person fs-2 text-primary"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">{selectedRequest.assignedTo.name}</div>
                          <div className="text-muted small">{selectedRequest.assignedTo.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <div className="card bg-light border-0 rounded-3">
                      <div className="card-body text-center">
                        <div className="text-muted small">Submitted</div>
                        <div className="fw-semibold">{formatDate(selectedRequest.submittedDate)}</div>
                      </div>
                    </div>
                  </div>
                  {selectedRequest.estimatedCompletion && (
                    <div className="col-md-4">
                      <div className="card bg-light border-0 rounded-3">
                        <div className="card-body text-center">
                          <div className="text-muted small">Est. Completion</div>
                          <div className="fw-semibold">{formatDate(selectedRequest.estimatedCompletion)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedRequest.completedDate && (
                    <div className="col-md-4">
                      <div className="card bg-light border-0 rounded-3">
                        <div className="card-body text-center">
                          <div className="text-muted small">Completed</div>
                          <div className="fw-semibold text-success">{formatDate(selectedRequest.completedDate)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Updates Timeline */}
                {selectedRequest.updates && selectedRequest.updates.length > 0 && (
                  <div className="card bg-light border-0 rounded-3">
                    <div className="card-body">
                      <div className="text-muted small text-uppercase fw-semibold mb-3">
                        <i className="bi bi-clock-history me-1"></i>Update History
                      </div>
                      <div className="timeline">
                        {selectedRequest.updates.map((update, idx) => (
                          <div key={idx} className="d-flex gap-3 mb-3">
                            <div className="flex-shrink-0">
                              <i className={`bi ${STATUS_CONFIG[update.status]?.icon || "bi-info-circle"} text-${STATUS_CONFIG[update.status]?.badge || "secondary"}`}></i>
                            </div>
                            <div>
                              <div className="fw-semibold">{update.message}</div>
                              <div className="text-muted small">{formatDate(update.date)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary rounded-pill" onClick={() => setSelectedRequest(null)}>
                  <i className="bi bi-x-circle me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hover-shadow {
          transition: all 0.2s ease-in-out;
        }
        .hover-shadow:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
}