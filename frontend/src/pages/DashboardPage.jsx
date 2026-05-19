import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { syncUser } from "../services/api";
import { useUser } from "../context/UserContext";

const ROLES = [
  { id: "resident",   label: "Resident",   icon: "bi-house-heart", desc: "I live in a property" },
  { id: "landlord",   label: "Landlord",   icon: "bi-key",         desc: "I own or manage properties" },
  { id: "contractor", label: "Contractor", icon: "bi-tools",       desc: "I do maintenance & repairs" },
];

export default function OnboardingPage() {
  const { user, getAccessTokenSilently } = useAuth0();
  const { setDbUser }                    = useUser();
  const [selectedRole, setSelectedRole]  = useState(null);
  const [loading, setLoading]            = useState(false);
  const [error, setError]                = useState("");

  const handleConfirm = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setError("");
    try {
      const token = await getAccessTokenSilently();
      const me = await syncUser(token, {
        name:    user.name,
        email:   user.email,
        picture: user.picture,
        role:    selectedRole,
      });
      setDbUser(me);
    } catch (err) {
      setError("Failed to save. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
      <div className="card shadow border-0 p-4" style={{ maxWidth: 480, width: "100%" }}>

        {/* Header */}
        <div className="text-center mb-4">
          {user?.picture && (
            <img src={user.picture} alt="" className="rounded-circle mb-3" width={72} height={72} />
          )}
          <h4 className="fw-bold">Welcome, {user?.name?.split(" ")[0]}!</h4>
          <p className="text-muted">Choose your role to get started</p>
        </div>

        {/* Role cards */}
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

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <button
          className="btn btn-primary w-100"
          disabled={!selectedRole || loading}
          onClick={handleConfirm}
        >
          {loading
            ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
            : "Continue →"}
        </button>
      </div>
    </div>
  );
}
