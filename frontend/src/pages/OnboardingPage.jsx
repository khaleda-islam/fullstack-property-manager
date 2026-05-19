import { useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { syncUser, updateProfile } from "../services/api";
import { useUser } from "../context/UserContext";
import Alert from "../components/Alert";
import { JOB_TYPES } from "../components/ProfileEditModal";
import CANADIAN_CITIES from "../constants/canadianCities";

const ROLES = [
  { id: "resident",   label: "Resident",   icon: "bi-house-heart", desc: "I live in a property"      },
  { id: "landlord",   label: "Landlord",   icon: "bi-key",         desc: "I own or manage properties" },
  { id: "contractor", label: "Contractor", icon: "bi-tools",       desc: "I do maintenance & repairs" },
];

const toBase64 = (file) =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload  = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

export default function OnboardingPage() {
  const { user, getAccessTokenSilently } = useAuth0();
  const { setDbUser }                    = useUser();

  // ── Step 1: role  |  Step 2: profile ──
  const [step,         setStep]         = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  // Profile form
  const [firstName,     setFirstName]     = useState("");
  const [lastName,      setLastName]      = useState("");
  const [email,         setEmail]         = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address,       setAddress]       = useState("");
  const [city,          setCity]          = useState("");
  const [state,         setState]         = useState("");
  const [jobType,       setJobType]       = useState("");
  const [photoBase64,   setPhotoBase64]   = useState("");
  const [photoPreview,  setPhotoPreview]  = useState("");

  const fileRef = useRef(null);

  // ── Step 1: confirm role ──────────────────────────────────────────────────
  const handleRoleNext = () => {
    if (!selectedRole) return;
    setError("");
    setStep(2);
  };

  // ── Photo picker ──────────────────────────────────────────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await toBase64(file);
    setPhotoBase64(base64);
    setPhotoPreview(base64);
  };

  // ── Step 2: save role + profile ───────────────────────────────────────────
  const handleFinish = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getAccessTokenSilently();

      // 1. Sync user (creates auth record with role)
      const me = await syncUser(token, {
        name:    user.name,
        email:   user.email,
        picture: user.picture,
        role:    selectedRole,
      });

      // 2. Save profile info
      await updateProfile(token, {
        firstName,
        lastName,
        email,
        contactNumber,
        address,
        city,
        state,
        jobType,
        ...(photoBase64 && { photoBase64 }),
      });

      // 3. Set user in context → app loads
      setDbUser(me);
    } catch (err) {
      setError("Failed to save. Please try again.");
      setLoading(false);
    }
  };

  // ── Step indicator ────────────────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
      {[1, 2].map((s) => (
        <div key={s} className="d-flex align-items-center gap-2">
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center fw-bold`}
            style={{
              width: 32, height: 32, fontSize: 13,
              background: step >= s ? "#0d6efd" : "#e9ecef",
              color:      step >= s ? "#fff"    : "#6c757d",
            }}
          >
            {step > s ? <i className="bi bi-check" /> : s}
          </div>
          <span className={`small fw-semibold ${step === s ? "text-primary" : "text-muted"}`}>
            {s === 1 ? "Choose Role" : "Your Profile"}
          </span>
          {s < 2 && <i className="bi bi-chevron-right text-muted" style={{ fontSize: 11 }} />}
        </div>
      ))}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center py-4">
      <div className="card shadow border-0 p-4" style={{ maxWidth: 520, width: "100%" }}>

        {/* Logo */}
        <div className="text-center mb-3">
          <span className="fw-bold fs-5 text-primary">🏠 T6PMS</span>
        </div>

        <StepIndicator />

        {/* ── STEP 1: Role ── */}
        {step === 1 && (
          <>
            <div className="text-center mb-4">
              {user?.picture && (
                <img src={user.picture} alt="" className="rounded-circle mb-3" width={68} height={68} />
              )}
              <h5 className="fw-bold">Welcome, {user?.name?.split(" ")[0]}!</h5>
              <p className="text-muted small">Choose your role to get started</p>
            </div>

            <div className="row g-3 mb-4">
              {ROLES.map((r) => (
                <div key={r.id} className="col-4">
                  <div
                    className={`card text-center p-3 h-100 border-2 ${selectedRole === r.id ? "border-primary bg-primary bg-opacity-10" : "border"}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedRole(r.id)}
                  >
                    <i className={`bi ${r.icon} fs-2 mb-2 ${selectedRole === r.id ? "text-primary" : "text-muted"}`} />
                    <div className={`fw-semibold small ${selectedRole === r.id ? "text-primary" : ""}`}>{r.label}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {error && <Alert type="danger" message={error} />}

            <button
              className="btn btn-primary w-100"
              disabled={!selectedRole}
              onClick={handleRoleNext}
            >
              Next →
            </button>
          </>
        )}

        {/* ── STEP 2: Profile ── */}
        {step === 2 && (
          <>
            <div className="text-center mb-4">
              {/* Photo picker */}
              <div className="position-relative d-inline-block mb-3">
                <img
                  src={photoPreview || "https://placehold.co/80x80/cccccc/ffffff?text=Photo"}
                  alt="profile"
                  className="rounded-circle border"
                  style={{ width: 80, height: 80, objectFit: "cover" }}
                />
                <button
                  className="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0 p-0 d-flex align-items-center justify-content-center"
                  style={{ width: 26, height: 26 }}
                  onClick={() => fileRef.current.click()}
                >
                  <i className="bi bi-camera" style={{ fontSize: 12 }} />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handlePhotoChange}
                />
              </div>
              <h5 className="fw-bold mb-1">Tell us about yourself</h5>
              <p className="text-muted small">All fields are optional — you can update later</p>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-6">
                <label className="form-label fw-semibold small">First Name</label>
                <input
                  className="form-control form-control-sm"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold small">Last Name</label>
                <input
                  className="form-control form-control-sm"
                  placeholder="Smith"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold small">Email</label>
                <input
                  className="form-control form-control-sm"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold small">Contact Number</label>
                <input
                  className="form-control form-control-sm"
                  placeholder="+1 (416) 555-0123"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold small">Address</label>
                <input
                  className="form-control form-control-sm"
                  placeholder="123 Main Street"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold small">City</label>
                {selectedRole === "contractor" ? (
                  <select
                    className="form-select form-select-sm"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    <option value="">Select city...</option>
                    {CANADIAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="form-control form-control-sm"
                    placeholder="Toronto"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                )}
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold small">State / Province</label>
                <input
                  className="form-control form-control-sm"
                  placeholder="Ontario"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              {/* Job type — contractors only */}
              {selectedRole === "contractor" && (
                <div className="col-12">
                  <label className="form-label fw-semibold small">
                    <i className="bi bi-tools me-1 text-warning" />Job Type
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                  >
                    <option value="">Select your job type...</option>
                    {JOB_TYPES.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {error && <Alert type="danger" message={error} />}

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                ← Back
              </button>
              <button
                className="btn btn-primary flex-grow-1"
                onClick={handleFinish}
                disabled={loading}
              >
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                  : <><i className="bi bi-check-lg me-1" />Finish & Get Started</>}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
