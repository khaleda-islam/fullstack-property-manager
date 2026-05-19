import { useState, useRef, useEffect } from "react";
import CANADIAN_CITIES from "../constants/canadianCities";

const DEFAULT_AVATAR = "https://placehold.co/100x100/cccccc/ffffff?text=No+Photo";

export const JOB_TYPES = [
  "Plumber",
  "House Cleaner",
  "Electrician",
  "HVAC Technician",
  "Carpenter",
  "Painter",
  "Roofer",
  "Landscaper",
  "Pest Control",
  "Appliance Repair",
  "Locksmith",
  "General Handyman",
];

const toBase64 = (file) =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload  = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

export default function ProfileEditModal({
  show          = false,
  profile       = null,
  saving        = false,
  error         = "",
  onSave        = () => {},
  onClose       = () => {},
  onRemovePhoto = () => {},
}) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    contactNumber: "", address: "", city: "", state: "",
    jobType: "", photoBase64: "", photoPreview: "",
  });

  const fileRef = useRef(null);

  useEffect(() => {
    if (show && profile) {
      setForm({
        firstName:     profile.firstName     || "",
        lastName:      profile.lastName      || "",
        email:         profile.email         || "",
        contactNumber: profile.contactNumber || "",
        address:       profile.address       || "",
        city:          profile.city          || "",
        state:         profile.state         || "",
        jobType:       profile.jobType       || "",
        photoBase64:   "",
        photoPreview:  profile.photo?.url    || "",
      });
    }
  }, [show, profile]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await toBase64(file);
    setForm((f) => ({ ...f, photoBase64: base64, photoPreview: base64 }));
  };

  const handleSave = () => {
    const { photoPreview, ...rest } = form;
    onSave(rest);
  };

  const isContractor = profile?.role === "contractor";

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow">

          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-pencil me-2 text-primary" />Edit Profile
            </h5>
            <button className="btn-close" onClick={onClose} disabled={saving} />
          </div>

          <div className="modal-body p-4">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                <i className="bi bi-x-circle-fill flex-shrink-0" />
                <span className="small">{error}</span>
              </div>
            )}

            {/* Photo */}
            <div className="text-center mb-4">
              <img
                src={form.photoPreview || DEFAULT_AVATAR}
                alt="preview"
                className="rounded-circle border shadow-sm mb-3"
                style={{ width: 100, height: 100, objectFit: "cover" }}
              />
              <div className="d-flex justify-content-center gap-2">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => fileRef.current.click()}
                  disabled={saving}
                >
                  <i className="bi bi-camera me-1" />Change Photo
                </button>
                {profile?.photo?.url && (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={onRemovePhoto}
                    disabled={saving}
                  >
                    <i className="bi bi-trash me-1" />Remove
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">First Name</label>
                <input className="form-control" name="firstName" placeholder="John"
                  value={form.firstName} onChange={handleChange} disabled={saving} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Last Name</label>
                <input className="form-control" name="lastName" placeholder="Smith"
                  value={form.lastName} onChange={handleChange} disabled={saving} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Email</label>
                <input className="form-control" name="email" type="email" placeholder="john@example.com"
                  value={form.email} onChange={handleChange} disabled={saving} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Contact Number</label>
                <input className="form-control" name="contactNumber" placeholder="+1 (416) 555-0123"
                  value={form.contactNumber} onChange={handleChange} disabled={saving} />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Address</label>
                <input className="form-control" name="address" placeholder="123 Main Street"
                  value={form.address} onChange={handleChange} disabled={saving} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">City</label>
                {isContractor ? (
                  <select
                    className="form-select"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="">Select city...</option>
                    {CANADIAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <input className="form-control" name="city" placeholder="Toronto"
                    value={form.city} onChange={handleChange} disabled={saving} />
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">State / Province</label>
                <input className="form-control" name="state" placeholder="Ontario"
                  value={form.state} onChange={handleChange} disabled={saving} />
              </div>

              {/* Job type — contractors only */}
              {isContractor && (
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-tools me-1 text-warning" />Job Type
                  </label>
                  <select
                    className="form-select"
                    name="jobType"
                    value={form.jobType}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="">Select job type...</option>
                    {JOB_TYPES.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
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
