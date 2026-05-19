import { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../../services/api";
import PropertyManagementPage from "./PropertyManagementPage";

const PER_PAGE      = 6;
const DEFAULT_IMAGE = "https://placehold.co/400x220/4A90D9/ffffff?text=No+Image";

// ── Helper: convert file to base64 ───────────────────────────────────────────
const toBase64 = (file) =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload  = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

// ── Empty form state ──────────────────────────────────────────────────────────
const EMPTY_FORM = { name: "", location: "", units: "", description: "", imageBase64: "", imagePreview: "" };

export default function PropertyDashboard() {
  const { getAccessTokenSilently } = useAuth0();

  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [error,      setError]      = useState("");

  // Modal state
  const [viewModal,      setViewModal]      = useState(null);
  const [editModal,      setEditModal]      = useState(null);
  const [addModal,       setAddModal]       = useState(false);
  const [manageProperty, setManageProperty] = useState(null);

  // Form state (shared for add + edit)
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [formError,   setFormError]   = useState("");

  const fileRef = useRef(null);

  // ── Load properties ─────────────────────────────────────────────────────────
  const load = async () => {
    try {
      const token = await getAccessTokenSilently();
      const data  = await getProperties(token);
      setProperties(data);
    } catch (err) {
      setError("Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Pagination ──────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(properties.length / PER_PAGE);
  const paginated  = properties.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Image picker ────────────────────────────────────────────────────────────
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await toBase64(file);
    setForm((f) => ({ ...f, imageBase64: base64, imagePreview: base64 }));
  };

  // ── Open modals ─────────────────────────────────────────────────────────────
  const openView = (p) => setViewModal(p);

  const openEdit = (p) => {
    setEditModal(p);
    setForm({
      name:         p.name,
      location:     p.location,
      units:        p.units,
      description:  p.description || "",
      imageBase64:  "",
      imagePreview: p.image?.url || "",
    });
    setFormError("");
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setAddModal(true);
  };

  const closeAll = () => {
    setViewModal(null);
    setEditModal(null);
    setAddModal(false);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  // ── Save (create or update) ──────────────────────────────────────────────────
  const handleSave = async (isEdit) => {
    if (!form.name || !form.location || !form.units) {
      setFormError("Name, location and units are required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const token   = await getAccessTokenSilently();
      const payload = {
        name:        form.name,
        location:    form.location,
        units:       form.units,
        description: form.description,
        ...(form.imageBase64 && { imageBase64: form.imageBase64 }),
      };
      if (isEdit) {
        await updateProperty(token, editModal._id, payload);
      } else {
        await createProperty(token, payload);
      }
      await load();
      closeAll();
    } catch (err) {
      setFormError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      const token = await getAccessTokenSilently();
      await deleteProperty(token, id);
      await load();
      closeAll();
    } catch (err) {
      alert("Failed to delete property.");
    }
  };

  // ── Form input helper ────────────────────────────────────────────────────────
  const handleFormChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ── Render ───────────────────────────────────────────────────────────────────
  // If a property is selected for management, show the management page
  if (manageProperty) {
    return (
      <PropertyManagementPage
        property={manageProperty}
        onBack={() => setManageProperty(null)}
      />
    );
  }

  return (
    <div className="p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">My Properties</h4>
          <p className="text-muted mb-0 small">{properties.length} properties total</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>
          <i className="bi bi-plus-lg me-1" />Add Property
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-3 fw-bold text-primary">{properties.length}</div>
            <div className="text-muted small">Total Properties</div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-building fs-1 d-block mb-2" />
          <p>No properties yet. Click <strong>Add Property</strong> to get started.</p>
        </div>
      ) : (
        <>
          {/* Property cards */}
          <div className="row g-4 mb-4">
            {paginated.map((p) => (
              <div key={p._id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <img
                    src={p.image?.url || DEFAULT_IMAGE}
                    alt={p.name}
                    className="card-img-top"
                    style={{ height: 180, objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h6 className="fw-bold mb-1">{p.name}</h6>
                    <p className="text-muted small mb-2">
                      <i className="bi bi-geo-alt me-1" />{p.location}
                    </p>
                    <p className="text-muted small mb-0">
                      <i className="bi bi-building me-1" />{p.units} units
                    </p>
                  </div>
                  <div className="card-footer bg-transparent border-top-0 pb-3 px-3 d-flex gap-2">
                    <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => openView(p)}>
                      <i className="bi bi-eye me-1" />View
                    </button>
                    <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => openEdit(p)}>
                      <i className="bi bi-pencil me-1" />Edit
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(p._id)}>
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="d-flex justify-content-center">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>
                    <i className="bi bi-chevron-left" />
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <li key={p} className={`page-item ${page === p ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>
                    <i className="bi bi-chevron-right" />
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      {/* ── VIEW MODAL ── */}
      {viewModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-building me-2 text-primary" />{viewModal.name}
                </h5>
                <button className="btn-close" onClick={closeAll} />
              </div>
              <div className="modal-body p-0">
                <img
                  src={viewModal.image?.url || DEFAULT_IMAGE}
                  alt={viewModal.name}
                  className="w-100"
                  style={{ height: 260, objectFit: "cover" }}
                />
                <div className="p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="text-muted small text-uppercase fw-semibold mb-1">Property Name</div>
                      <div className="fw-semibold">{viewModal.name}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small text-uppercase fw-semibold mb-1">Location</div>
                      <div className="fw-semibold">
                        <i className="bi bi-geo-alt me-1 text-danger" />{viewModal.location}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small text-uppercase fw-semibold mb-1">Total Units</div>
                      <div className="fw-semibold">
                        <i className="bi bi-building me-1 text-primary" />{viewModal.units}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small text-uppercase fw-semibold mb-1">Added On</div>
                      <div className="fw-semibold">
                        {new Date(viewModal.createdAt).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" })}
                      </div>
                    </div>
                    {viewModal.description && (
                      <div className="col-12">
                        <div className="text-muted small text-uppercase fw-semibold mb-1">Description</div>
                        <div className="text-muted">{viewModal.description}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={closeAll}>Close</button>
                <button className="btn btn-success" onClick={() => {
                  closeAll();
                  setManageProperty(viewModal);
                }}>
                  <i className="bi bi-people me-1" />Property Management
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT MODAL (shared form) ── */}
      {(addModal || editModal) && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className={`bi ${editModal ? "bi-pencil" : "bi-plus-circle"} me-2 text-primary`} />
                  {editModal ? "Edit Property" : "Add New Property"}
                </h5>
                <button className="btn-close" onClick={closeAll} />
              </div>
              <div className="modal-body">
                {formError && <div className="alert alert-danger py-2 small">{formError}</div>}

                <div className="row g-3">
                  {/* Name */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Property Name <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      name="name"
                      placeholder="e.g. Maple Residences"
                      value={form.name}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* Units */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Total Units <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      name="units"
                      type="number"
                      min="1"
                      placeholder="e.g. 12"
                      value={form.units}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* Location */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">Location <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      name="location"
                      placeholder="e.g. 123 Maple St, Toronto, ON"
                      value={form.location}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* Description */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows={3}
                      placeholder="Optional description..."
                      value={form.description}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* Image upload */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">Property Photo</label>
                    <input
                      ref={fileRef}
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {form.imagePreview && (
                      <img
                        src={form.imagePreview}
                        alt="preview"
                        className="mt-2 rounded w-100"
                        style={{ height: 180, objectFit: "cover" }}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={closeAll} disabled={saving}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleSave(!!editModal)}
                  disabled={saving}
                >
                  {saving
                    ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                    : <><i className="bi bi-check-lg me-1" />{editModal ? "Save Changes" : "Add Property"}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
