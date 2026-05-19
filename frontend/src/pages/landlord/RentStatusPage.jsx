import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getAssignments, updateRentStatus } from "../../services/api";
import RentStatusModal from "../../components/RentStatusModal";
import Toast           from "../../components/Toast";

const DEFAULT_AVATAR = "https://placehold.co/48x48/cccccc/ffffff?text=?";

export default function RentStatusPage({ property, onBack }) {
  const { getAccessTokenSilently } = useAuth0();

  const [assignments,    setAssignments]    = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [editAssignment, setEditAssignment] = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [toast,          setToast]          = useState({ show: false, type: "success", message: "" });

  const showToast = (type, message) => setToast({ show: true, type, message });

  // ── Load ──────────────────────────────────────────────────────────────────
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

  // ── Save rent status ──────────────────────────────────────────────────────
  const handleSave = async (rentPaid) => {
    setSaving(true);
    try {
      const token = await getAccessTokenSilently();
      await updateRentStatus(token, editAssignment._id, rentPaid);
      await load();
      setEditAssignment(null);
      showToast("success", `Rent marked as ${rentPaid ? "Paid" : "Unpaid"}.`);
    } catch {
      showToast("danger", "Failed to update rent status.");
    } finally {
      setSaving(false);
    }
  };

  // ── Summary counts ────────────────────────────────────────────────────────
  const paid   = assignments.filter((a) => a.rentPaid).length;
  const unpaid = assignments.filter((a) => !a.rentPaid).length;

  const fullName = (r) =>
    [r?.firstName, r?.lastName].filter(Boolean).join(" ") || r?.name || "—";

  return (
    <div className="p-4">

      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>
          <i className="bi bi-arrow-left me-1" />Back
        </button>
        <div className="flex-grow-1">
          <h4 className="fw-bold mb-0">Rent Status</h4>
          <p className="text-muted small mb-0">
            <i className="bi bi-building me-1" />{property.name}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-3 fw-bold text-secondary">{assignments.length}</div>
            <div className="text-muted small">
              <i className="bi bi-people me-1" />Total Residents
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-3 fw-bold text-success">{paid}</div>
            <div className="text-muted small">
              <i className="bi bi-check-circle me-1" />Paid
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-3 fw-bold text-danger">{unpaid}</div>
            <div className="text-muted small">
              <i className="bi bi-x-circle me-1" />Unpaid
            </div>
          </div>
        </div>
      </div>

      {/* Residents list */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-transparent border-bottom py-3 px-4 fw-semibold">
          <i className="bi bi-cash-coin me-2 text-success" />Rent Overview
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-people fs-1 d-block mb-2 opacity-50" />
              <p>No residents assigned to this property yet.</p>
            </div>
          ) : (
            <ul className="list-group list-group-flush">
              {assignments.map((a) => {
                const name = fullName(a.resident);
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
                        <div className="text-muted small mt-1">
                          <i className="bi bi-calendar me-1" />
                          Lease expires: {new Date(a.leaseExpireDate).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Rent status badge */}
                      <span className={`badge fs-6 px-3 py-2 bg-${a.rentPaid ? "success" : "danger"} flex-shrink-0`}>
                        <i className={`bi bi-${a.rentPaid ? "check-circle" : "x-circle"} me-1`} />
                        {a.rentPaid ? "Paid" : "Unpaid"}
                      </span>

                      {/* Edit button */}
                      <button
                        className="btn btn-outline-secondary btn-sm flex-shrink-0"
                        title="Edit rent status"
                        onClick={() => setEditAssignment(a)}
                      >
                        <i className="bi bi-pencil" />
                      </button>

                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Rent Status Modal */}
      <RentStatusModal
        show={!!editAssignment}
        assignment={editAssignment}
        saving={saving}
        onSave={handleSave}
        onClose={() => setEditAssignment(null)}
      />

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

    </div>
  );
}
