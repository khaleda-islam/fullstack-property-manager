import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { getMyAssignment } from "../../services/api";

const DEFAULT_IMAGE = "https://placehold.co/800x400/4A90D9/ffffff?text=No+Photo";

const downloadFile = async (url, fileName) => {
  try {
    const res  = await fetch(url);
    const blob = await res.blob();
    const link = document.createElement("a");
    link.href     = URL.createObjectURL(blob);
    link.download = fileName || "lease.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch {
    window.open(url, "_blank");
  }
};

export default function PropertyDetail() {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token  = await getAccessTokenSilently();
        const result = await getMyAssignment(token);
        setData(result);
      } catch (err) {
        setError("No active property assignment found.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner-border text-success" />
      </div>
    );
  }

  // ── No assignment ──────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="p-4" style={{ maxWidth: 860 }}>
        <div className="text-center py-5">
          <i className="bi bi-house-x text-muted fs-1 d-block mb-3" />
          <h5 className="fw-bold text-muted">No Property Assigned</h5>
          <p className="text-muted small">
            You have not been assigned to a property yet. Please contact your landlord.
          </p>
        </div>
      </div>
    );
  }

  const { property, landlord, leaseExpireDate, leaseDocument, status, createdAt } = data;
  const isExpired  = new Date(leaseExpireDate) < new Date();
  const leaseStart = new Date(createdAt).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" });
  const leaseEnd   = new Date(leaseExpireDate).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="p-4" style={{ maxWidth: 860 }}>

      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">My Property</h4>
        <p className="text-muted small mb-0">Your current rental property details</p>
      </div>

      {/* Property photo */}
      <div className="card border-0 shadow-sm mb-4 overflow-hidden">
        <img
          src={property.image?.url || DEFAULT_IMAGE}
          alt={property.name}
          className="w-100"
          style={{ height: 280, objectFit: "cover" }}
        />
      </div>

      {/* Property info */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">

          {/* Name + status */}
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <h5 className="fw-bold mb-0">{property.name}</h5>
            <span className={`badge fs-6 px-3 py-2 bg-${isExpired ? "danger" : status === "active" ? "success" : "secondary"}`}>
              <i className={`bi bi-${isExpired ? "x-circle" : "check-circle"} me-1`} />
              {isExpired ? "Lease Expired" : "Active Lease"}
            </span>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <div className="text-muted small text-uppercase fw-semibold mb-1">Property Name</div>
              <div className="fw-semibold">
                <i className="bi bi-building text-primary me-1" />{property.name}
              </div>
            </div>

            <div className="col-md-6">
              <div className="text-muted small text-uppercase fw-semibold mb-1">Location</div>
              <div className="fw-semibold">
                <i className="bi bi-geo-alt text-danger me-1" />{property.location}
              </div>
            </div>

            <div className="col-md-6">
              <div className="text-muted small text-uppercase fw-semibold mb-1">Lease Start</div>
              <div className="fw-semibold">
                <i className="bi bi-calendar-check text-success me-1" />{leaseStart}
              </div>
            </div>

            <div className="col-md-6">
              <div className="text-muted small text-uppercase fw-semibold mb-1">Lease Expiry</div>
              <div className={`fw-semibold ${isExpired ? "text-danger" : ""}`}>
                <i className={`bi bi-calendar-x ${isExpired ? "text-danger" : "text-warning"} me-1`} />
                {leaseEnd}
                {isExpired && <span className="badge bg-danger ms-2 small">Expired</span>}
              </div>
            </div>

            <div className="col-12">
              <div className="text-muted small text-uppercase fw-semibold mb-2">Landlord</div>
              <div className="d-flex align-items-center gap-3 bg-light rounded-3 p-3">
                {/* Landlord photo */}
                <img
                  src={landlord.photo || "https://placehold.co/56x56/cccccc/ffffff?text=?"}
                  alt={landlord.name}
                  className="rounded-circle border flex-shrink-0"
                  style={{ width: 56, height: 56, objectFit: "cover" }}
                />
                {/* Landlord info */}
                <div className="flex-grow-1">
                  <div className="fw-semibold">
                    {landlord.name || "—"}
                  </div>
                  {landlord.email && (
                    <div className="text-muted small">
                      <i className="bi bi-envelope me-1" />{landlord.email}
                    </div>
                  )}
                  {landlord.contactNumber && (
                    <div className="text-muted small">
                      <i className="bi bi-telephone me-1" />{landlord.contactNumber}
                    </div>
                  )}
                  {!landlord.contactNumber && (
                    <div className="text-muted small fst-italic">
                      <i className="bi bi-telephone me-1" />No contact number
                    </div>
                  )}
                </div>
                {/* Message button */}
                <button
                  className="btn btn-success btn-sm flex-shrink-0"
                  title="Message landlord"
                  onClick={() => navigate("/messages", { state: { initialUserId: landlord.auth0Id } })}
                >
                  <i className="bi bi-chat-dots me-1" />Message
                </button>
              </div>
            </div>

            {property.description && (
              <div className="col-12">
                <div className="text-muted small text-uppercase fw-semibold mb-1">Description</div>
                <div className="text-muted" style={{ lineHeight: 1.7 }}>{property.description}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lease document */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className={`rounded-3 p-3 ${leaseDocument?.url ? "bg-danger bg-opacity-10" : "bg-light"}`}>
              <i className={`bi bi-file-earmark-pdf fs-3 ${leaseDocument?.url ? "text-danger" : "text-muted"}`} />
            </div>
            <div>
              <div className="fw-bold">Lease Agreement</div>
              <div className="text-muted small">
                {leaseDocument?.fileName || (leaseDocument?.url ? "lease_agreement.pdf" : "No document uploaded")}
              </div>
            </div>
          </div>

          {leaseDocument?.url ? (
            <button
              className="btn btn-outline-danger"
              onClick={() => downloadFile(leaseDocument.url, leaseDocument.fileName || "lease_agreement.pdf")}
            >
              <i className="bi bi-download me-2" />Download Lease PDF
            </button>
          ) : (
            <span className="text-muted small fst-italic">
              <i className="bi bi-info-circle me-1" />Not uploaded yet
            </span>
          )}
        </div>
      </div>

    </div>

  );
}
