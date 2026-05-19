import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from "../context/UserContext";
import { getProfile, updateProfile, deleteProfilePhoto } from "../services/api";
import ProfileEditModal  from "../components/ProfileEditModal";
import ProfileSaveAlert  from "../components/ProfileSaveAlert";

const ROLE_BADGE = {
  resident:   "success",
  landlord:   "primary",
  contractor: "warning",
};

const DEFAULT_AVATAR = "https://placehold.co/110x110/cccccc/ffffff?text=No+Photo";

export default function ProfilePage() {
  const { logout, getAccessTokenSilently } = useAuth0();
  const { dbUser } = useUser(); // ← role lives here, not in profile

  const [profile,    setProfile]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [modalError, setModalError] = useState("");
  const [alert,      setAlert]      = useState({ show: false, type: "success", message: "" });

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = async () => {
    try {
      const token = await getAccessTokenSilently();
      const data  = await getProfile(token);
      setProfile(data);
    } catch {
      setAlert({ show: true, type: "danger", message: "Failed to load profile." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (formData) => {
    setSaving(true);
    setModalError("");
    try {
      const token   = await getAccessTokenSilently();
      const updated = await updateProfile(token, formData);
      setProfile(updated);
      setShowModal(false);
      setAlert({ show: true, type: "success", message: "Profile updated successfully!" });
    } catch {
      setModalError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Remove photo ──────────────────────────────────────────────────────────
  const handleRemovePhoto = async () => {
    if (!window.confirm("Remove your profile photo?")) return;
    try {
      const token   = await getAccessTokenSilently();
      const updated = await deleteProfilePhoto(token);
      setProfile(updated);
      setAlert({ show: true, type: "success", message: "Photo removed." });
    } catch {
      setAlert({ show: true, type: "danger", message: "Failed to remove photo." });
    }
  };

  const fullName     = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "—"
    : "—";
  const role         = dbUser?.role || "";
  const isContractor = role === "contractor";

  // ── Info rows — shared fields + contractor-only jobType ───────────────────
  const INFO_ROWS = [
    { label: "First Name",     icon: "bi-person",    value: profile?.firstName     },
    { label: "Last Name",      icon: "bi-person",    value: profile?.lastName      },
    { label: "Email",          icon: "bi-envelope",  value: profile?.email         },
    { label: "Contact Number", icon: "bi-telephone", value: profile?.contactNumber },
    { label: "Address",        icon: "bi-house",     value: profile?.address       },
    { label: "City",           icon: "bi-geo",       value: profile?.city          },
    { label: "State",          icon: "bi-map",       value: profile?.state         },
    ...(isContractor
      ? [{ label: "Job Type", icon: "bi-tools", value: profile?.jobType }]
      : []),
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 700 }}>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">My Profile</h3>
          <p className="text-muted small mb-0">Manage your personal information</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <i className="bi bi-pencil me-1" />Edit Profile
        </button>
      </div>

      {/* ProfileSaveAlert — inline, sits between header and card */}
      <ProfileSaveAlert
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert((a) => ({ ...a, show: false }))}
      />

      {/* Profile card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <div className="position-relative flex-shrink-0">
              <img
                src={profile?.photo?.url || DEFAULT_AVATAR}
                alt={fullName}
                className="rounded-circle border shadow-sm"
                style={{ width: 110, height: 110, objectFit: "cover" }}
              />
              {role && (
                <span
                  className={`badge bg-${ROLE_BADGE[role] || "secondary"} position-absolute bottom-0 end-0`}
                  style={{ fontSize: 10 }}
                >
                  {role}
                </span>
              )}
            </div>
            <div>
              <h4 className="fw-bold mb-1">{fullName}</h4>
              <p className="text-muted mb-1">
                <i className="bi bi-envelope me-1" />
                {profile?.email || "—"}
              </p>
              {/* Job type badge for contractors */}
              {isContractor && profile?.jobType && (
                <span className="badge bg-warning text-dark">
                  <i className="bi bi-tools me-1" />{profile.jobType}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details table */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-transparent border-bottom fw-semibold py-3 px-4">
          Personal Information
        </div>
        <div className="card-body p-0">
          <table className="table table-borderless mb-0">
            <tbody>
              {INFO_ROWS.map(({ label, icon, value }) => (
                <tr key={label} className="border-bottom">
                  <td className="text-muted ps-4 py-3" style={{ width: "35%" }}>
                    <i className={`bi ${icon} me-2`} />{label}
                  </td>
                  <td className={`py-3 fw-semibold ${!value ? "text-muted fst-italic" : ""}`}>
                    {value || "Not set"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sign out */}
      <button
        className="btn btn-outline-danger w-100"
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      >
        <i className="bi bi-box-arrow-right me-2" />Sign Out
      </button>

      {/* Edit Modal */}
      <ProfileEditModal
        show={showModal}
        profile={{ ...profile, role }}
        saving={saving}
        error={modalError}
        onSave={handleSave}
        onClose={() => { setShowModal(false); setModalError(""); }}
        onRemovePhoto={handleRemovePhoto}
      />

    </div>
  );
}
