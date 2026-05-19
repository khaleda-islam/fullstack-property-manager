import { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../../services/api";
import { useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import Toast from "../../components/Toast";
import AssignmentSuccessAlert from "../../components/AssignmentSuccessAlert";
import RentStatusPage          from "./RentStatusPage";
import MaintenanceRequestsPage from "./MaintenanceRequestsPage";
import DownloadButton          from "../../components/DownloadButton";

const DEFAULT_AVATAR = "https://placehold.co/48x48/cccccc/ffffff?text=?";

const toBase64 = (file) =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload  = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

// ── Assign Modal ──────────────────────────────────────────────────────────────
function AssignModal({ show, saving, error, onSave, onClose }) {
  const [residentEmail,        setResidentEmail]        = useState("");
  const [leaseExpireDate,      setLeaseExpireDate]      = useState("");
  const [leaseDocumentBase64,  setLeaseDocumentBase64]  = useState("");
  const [leaseDocumentName,    setLeaseDocumentName]    = useState("");
  const fileRef = useRef(null);

  const reset = () => {
    setResidentEmail(""); setLeaseExpireDate("");
    setLeaseDocumentBase64(""); setLeaseDocumentName("");
  };

  useEffect(() => { if (!show) reset(); }, [show]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await toBase64(file);
    setLeaseDocumentBase64(base64);
    setLeaseDocumentName(file.name);
  };

  const handleSave = () => {
    onSave({ residentEmail, leaseExpireDate, leaseDocumentBase64, leaseDocumentName });
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-person-plus me-2 text-success" />Assign Resident
            </h5>
            <button className="btn-close" onClick={onClose} disabled={saving} />
          </div>
          <div className="modal-body p-4">
            {error && <Alert type="danger" message={error} />}

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">
                  Resident Email <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="email"
                  placeholder="resident@example.com"
                  value={residentEmail}
                  onChange={(e) => setResidentEmail(e.target.value)}
                  disabled={saving}
                />
                <div className="text-muted small mt-1">
                  <i className="bi bi-info-circle me-1" />
                  The resident must already have a T6PMS account
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">
                  Lease Expire Date <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="date"
                  value={leaseExpireDate}
                  onChange={(e) => setLeaseExpireDate(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">
                  Lease Document <span className="text-muted fw-normal">(PDF)</span>
                </label>
                <div
                  className="border border-2 rounded-3 text-center py-3 px-2"
                  style={{ cursor: "pointer", borderStyle: "dashed" }}
                  onClick={() => fileRef.current.click()}
                >
                  {leaseDocumentName ? (
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <i className="bi bi-file-earmark-pdf text-danger fs-4" />
                      <span className="small fw-semibold text-truncate">{leaseDocumentName}</span>
                    </div>
                  ) : (
                    <>
                      <i className="bi bi-cloud-upload text-primary fs-3 d-block mb-1" />
                      <div className="small text-primary fw-semibold">Click to upload PDF</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>Lease agreement document</div>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="d-none"
                    onChange={handleFile}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn btn-success" onClick={handleSave} disabled={saving || !residentEmail || !leaseExpireDate}>
              {saving
                ? <><span className="spinner-border spinner-border-sm me-2" />Assigning...</>
                : <><i className="bi bi-person-check me-1" />Assign Resident</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── View Resident Modal ───────────────────────────────────────────────────────
function ViewResidentModal({ assignment, onClose }) {
  if (!assignment) return null;
  const { resident, leaseExpireDate, leaseDocument, status, createdAt } = assignment;

  const isExpired  = new Date(leaseExpireDate) < new Date();
  const fullName   = [resident?.firstName, resident?.lastName].filter(Boolean).join(" ") || resident?.name || "—";

  const INFO_ROWS = [
    { label: "First Name",      icon: "bi-person",       value: resident?.firstName     },
    { label: "Last Name",       icon: "bi-person",       value: resident?.lastName      },
    { label: "Email",           icon: "bi-envelope",     value: resident?.email         },
    { label: "Contact Number",  icon: "bi-telephone",    value: resident?.contactNumber },
    { label: "Address",         icon: "bi-house",        value: resident?.address       },
    { label: "City",            icon: "bi-geo",          value: resident?.city          },
    { label: "State",           icon: "bi-map",          value: resident?.state         },
  ];

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-person-circle me-2 text-primary" />Resident Profile
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body p-4">

            {/* Photo + name */}
            <div className="d-flex align-items-center gap-3 mb-4">
              <img
                src={resident?.photo || DEFAULT_AVATAR}
                alt={fullName}
                className="rounded-circle border shadow-sm flex-shrink-0"
                width={72} height={72}
                style={{ objectFit: "cover" }}
              />
              <div>
                <h6 className="fw-bold mb-1">{fullName}</h6>
                <span className={`badge bg-${status === "active" ? "success" : "secondary"}`}>
                  {status}
                </span>
              </div>
            </div>

            {/* Profile info table */}
            <div className="card border-0 bg-light rounded-3 mb-3">
              <div className="card-header bg-transparent border-bottom fw-semibold small py-2 px-3">
                Personal Information
              </div>
              <div className="card-body p-0">
                <table className="table table-borderless mb-0 small">
                  <tbody>
                    {INFO_ROWS.map(({ label, icon, value }) => (
                      <tr key={label} className="border-bottom">
                        <td className="text-muted ps-3 py-2" style={{ width: "40%" }}>
                          <i className={`bi ${icon} me-1`} />{label}
                        </td>
                        <td className={`py-2 fw-semibold ${!value ? "text-muted fst-italic" : ""}`}>
                          {value || "Not set"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lease info */}
            <div className="card border-0 bg-light rounded-3">
              <div className="card-header bg-transparent border-bottom fw-semibold small py-2 px-3">
                Lease Information
              </div>
              <div className="card-body p-0">
                <table className="table table-borderless mb-0 small">
                  <tbody>
                    <tr className="border-bottom">
                      <td className="text-muted ps-3 py-2" style={{ width: "40%" }}>
                        <i className="bi bi-calendar-check me-1" />Assigned On
                      </td>
                      <td className="py-2 fw-semibold">
                        {new Date(createdAt).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" })}
                      </td>
                    </tr>
                    <tr className="border-bottom">
                      <td className="text-muted ps-3 py-2">
                        <i className="bi bi-calendar-x me-1" />Lease Expires
                      </td>
                      <td className="py-2 fw-semibold">
                        <span className={isExpired ? "text-danger" : ""}>
                          {new Date(leaseExpireDate).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                        {isExpired && <span className="badge bg-danger ms-2">Expired</span>}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-3 py-2">
                        <i className="bi bi-file-earmark-pdf me-1" />Lease Document
                      </td>
                      <td className="py-2">
                        {leaseDocument?.url ? (
                          <DownloadButton
                            url={leaseDocument.url}
                            fileName={leaseDocument.fileName}
                          />
                        ) : (
                          <span className="text-muted fst-italic">No document uploaded</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Edit Lease Modal ──────────────────────────────────────────────────────────
function EditLeaseModal({ assignment, saving, error, onSave, onClose }) {
  const [leaseExpireDate,     setLeaseExpireDate]     = useState("");
  const [leaseDocumentBase64, setLeaseDocumentBase64] = useState("");
  const [leaseDocumentName,   setLeaseDocumentName]   = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (assignment) {
      setLeaseExpireDate(assignment.leaseExpireDate?.slice(0, 10) || "");
      setLeaseDocumentBase64("");
      setLeaseDocumentName(assignment.leaseDocument?.fileName || "");
    }
  }, [assignment]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await toBase64(file);
    setLeaseDocumentBase64(base64);
    setLeaseDocumentName(file.name);
  };

  if (!assignment) return null;

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-pencil me-2 text-warning" />Edit Lease
            </h5>
            <button className="btn-close" onClick={onClose} disabled={saving} />
          </div>
          <div className="modal-body p-4">
            {error && <Alert type="danger" message={error} />}

            {/* Resident summary */}
            <div className="d-flex align-items-center gap-2 mb-4 p-2 bg-light rounded-3">
              <img
                src={assignment.resident?.photo || DEFAULT_AVATAR}
                alt=""
                className="rounded-circle"
                width={36} height={36}
                style={{ objectFit: "cover" }}
              />
              <div>
                <div className="fw-semibold small">
                  {[assignment.resident?.firstName, assignment.resident?.lastName].filter(Boolean).join(" ") || assignment.resident?.name}
                </div>
                <div className="text-muted" style={{ fontSize: 11 }}>{assignment.resident?.email}</div>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">
                  New Lease Expire Date <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="date"
                  value={leaseExpireDate}
                  onChange={(e) => setLeaseExpireDate(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">
                  Replace Lease Document <span className="text-muted fw-normal">(optional)</span>
                </label>
                <div
                  className="border border-2 rounded-3 text-center py-3 px-2"
                  style={{ cursor: "pointer", borderStyle: "dashed" }}
                  onClick={() => fileRef.current.click()}
                >
                  {leaseDocumentName ? (
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <i className="bi bi-file-earmark-pdf text-danger fs-4" />
                      <span className="small fw-semibold text-truncate">{leaseDocumentName}</span>
                    </div>
                  ) : (
                    <>
                      <i className="bi bi-arrow-repeat text-warning fs-3 d-block mb-1" />
                      <div className="small text-warning fw-semibold">Click to replace PDF</div>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="d-none"
                    onChange={handleFile}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button
              className="btn btn-warning"
              onClick={() => onSave({ leaseExpireDate, leaseDocumentBase64, leaseDocumentName })}
              disabled={saving || !leaseExpireDate}
            >
              {saving
                ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                : <><i className="bi bi-check-lg me-1" />Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PropertyManagementPage({ property, onBack }) {
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();

  const [assignments,   setAssignments]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showAssign,    setShowAssign]    = useState(false);
  const [viewAssignment,setViewAssignment]= useState(null);
  const [editAssignment,setEditAssignment]= useState(null);
  const [saving,        setSaving]        = useState(false);
  const [modalError,    setModalError]    = useState("");
  const [toast,         setToast]         = useState({ show: false, type: "success", message: "" });
  const [assignSuccess, setAssignSuccess] = useState({ show: false, residentName: "" });
  const [showRentStatus,    setShowRentStatus]    = useState(false);
  const [showMaintenance,   setShowMaintenance]   = useState(false);

  const showToast = (type, message) => setToast({ show: true, type, message });

  // ── Load assignments ────────────────────────────────────────────────────────
  const load = async () => {
    try {
      const token = await getAccessTokenSilently();
      const data  = await getAssignments(token, property._id);
      setAssignments(data);
    } catch {
      showToast("danger", "Failed to load residents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Assign resident ─────────────────────────────────────────────────────────
  const handleAssign = async (formData) => {
    setSaving(true);
    setModalError("");
    try {
      const token  = await getAccessTokenSilently();
      const result = await createAssignment(token, property._id, formData);
      await load();
      setShowAssign(false);
      // Show custom assignment success alert with resident name
      const residentName = [result.resident?.firstName, result.resident?.lastName]
        .filter(Boolean).join(" ") || result.resident?.name || formData.residentEmail;
      setAssignSuccess({ show: true, residentName });
    } catch (err) {
      setModalError(err.message || "Failed to assign resident.");
    } finally {
      setSaving(false);
    }
  };

  // ── Update lease ────────────────────────────────────────────────────────────
  const handleUpdateLease = async (formData) => {
    setSaving(true);
    setModalError("");
    try {
      const token = await getAccessTokenSilently();
      await updateAssignment(token, editAssignment._id, formData);
      await load();
      setEditAssignment(null);
      showToast("success", "Lease updated successfully!");
    } catch {
      setModalError("Failed to update lease.");
    } finally {
      setSaving(false);
    }
  };

  // ── Remove resident ─────────────────────────────────────────────────────────
  const handleRemove = async (assignmentId, residentName) => {
    if (!window.confirm(`Remove ${residentName} from this property?`)) return;
    try {
      const token = await getAccessTokenSilently();
      await deleteAssignment(token, assignmentId);
      await load();
      showToast("success", "Resident removed from property.");
    } catch {
      showToast("danger", "Failed to remove resident.");
    }
  };

  return (
    <>
    {showRentStatus && (
      <RentStatusPage property={property} onBack={() => setShowRentStatus(false)} />
    )}

    {showMaintenance && (
      <MaintenanceRequestsPage property={property} onBack={() => setShowMaintenance(false)} />
    )}

    {!showRentStatus && !showMaintenance && (
    <div className="p-4">

      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>
          <i className="bi bi-arrow-left me-1" />Back
        </button>
        <div className="flex-grow-1">
          <h4 className="fw-bold mb-0">{property.name}</h4>
          <p className="text-muted small mb-0">
            <i className="bi bi-geo-alt me-1" />{property.location}
          </p>
        </div>
        <button
          className="btn btn-outline-warning btn-sm"
          onClick={() => setShowMaintenance(true)}
        >
          <i className="bi bi-tools me-1" />Maintenance Requests
        </button>
        <button
          className="btn btn-outline-success btn-sm"
          onClick={() => setShowRentStatus(true)}
        >
          <i className="bi bi-cash-coin me-1" />Rent Status
        </button>
        <button className="btn btn-success btn-sm" onClick={() => { setShowAssign(true); setModalError(""); }}>
          <i className="bi bi-person-plus me-1" />Assign Resident
        </button>
      </div>

      {/* Residents section */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between py-3 px-4">
          <span className="fw-semibold">
            <i className="bi bi-people me-2 text-success" />
            Assigned Residents
            <span className="badge bg-success ms-2">{assignments.length}</span>
          </span>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-people fs-1 d-block mb-2 opacity-50" />
              <p className="mb-1">No residents assigned yet</p>
              <small>Click <strong>Assign Resident</strong> to add someone</small>
            </div>
          ) : (
            <ul className="list-group list-group-flush">
              {assignments.map((a) => {
                const name = [a.resident?.firstName, a.resident?.lastName].filter(Boolean).join(" ") || a.resident?.name || "—";
                const isExpired = new Date(a.leaseExpireDate) < new Date();
                return (
                  <li key={a._id} className="list-group-item px-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      {/* Photo */}
                      <img
                        src={a.resident?.photo || DEFAULT_AVATAR}
                        alt={name}
                        className="rounded-circle border flex-shrink-0"
                        width={48} height={48}
                        style={{ objectFit: "cover" }}
                      />

                      {/* Info */}
                      <div className="flex-grow-1 min-width-0">
                        <div className="fw-semibold">{name}</div>
                        <div className="text-muted small">{a.resident?.email}</div>
                        <div className="d-flex gap-2 mt-1 flex-wrap">
                          <span className={`badge bg-${a.status === "active" ? "success" : "secondary"}`}>
                            {a.status}
                          </span>
                          <span className={`badge bg-${isExpired ? "danger" : "light"} ${isExpired ? "" : "text-muted border"}`}>
                            <i className={`bi bi-calendar${isExpired ? "-x" : "-check"} me-1`} />
                            {isExpired ? "Expired " : "Until "}
                            {new Date(a.leaseExpireDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="d-flex gap-2 flex-shrink-0">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          title="View profile"
                          onClick={() => setViewAssignment(a)}
                        >
                          <i className="bi bi-eye" />
                        </button>
                        <button
                          className="btn btn-outline-success btn-sm"
                          title="Message resident"
                          onClick={() => navigate("/messages", { state: { initialUserId: a.residentId } })}
                        >
                          <i className="bi bi-chat-dots" />
                        </button>
                        <button
                          className="btn btn-outline-warning btn-sm"
                          title="Edit lease"
                          onClick={() => { setEditAssignment(a); setModalError(""); }}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          title="Remove resident"
                          onClick={() => handleRemove(a._id, name)}
                        >
                          <i className="bi bi-person-dash" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Modals */}
      <AssignModal
        show={showAssign}
        saving={saving}
        error={modalError}
        onSave={handleAssign}
        onClose={() => setShowAssign(false)}
      />
      <ViewResidentModal
        assignment={viewAssignment}
        onClose={() => setViewAssignment(null)}
      />
      <EditLeaseModal
        assignment={editAssignment}
        saving={saving}
        error={modalError}
        onSave={handleUpdateLease}
        onClose={() => setEditAssignment(null)}
      />

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      <AssignmentSuccessAlert
        show={assignSuccess.show}
        residentName={assignSuccess.residentName}
        propertyName={property.name}
        onClose={() => setAssignSuccess({ show: false, residentName: "" })}
      />
    </div>
    )}
    </>
  );
}
