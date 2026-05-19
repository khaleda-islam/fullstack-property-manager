// ── Usage ─────────────────────────────────────────────────────────────────────
//
// <PhotoUpload
//   photos={photos}
//   onChange={setPhotos}
//   maxPhotos={3}
//   disabled={submitting}
// />
//
// photos shape: [{ file, preview, name }]
// onChange: (updatedPhotos) => void
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB     = 5;

export default function PhotoUpload({
  photos    = [],
  onChange  = () => {},
  maxPhotos = 3,
  disabled  = false,
}) {
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    setError("");
    const files     = Array.from(e.target.files);
    const remaining = maxPhotos - photos.length;

    if (files.length === 0) return;

    // Validate each file
    const validFiles = [];
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`"${file.name}" is not a supported image type. Use JPG, PNG or WEBP.`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`"${file.name}" exceeds ${MAX_SIZE_MB}MB. Please choose a smaller file.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    // Enforce max limit
    if (photos.length >= maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed.`);
      e.target.value = "";
      return;
    }

    const toAdd = validFiles.slice(0, remaining);

    if (validFiles.length > remaining) {
      setError(`Only ${remaining} more photo${remaining === 1 ? "" : "s"} can be added. ${validFiles.length - remaining} file${validFiles.length - remaining === 1 ? " was" : "s were"} skipped.`);
    }

    const newPhotos = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name:    file.name,
    }));

    onChange([...photos, ...newPhotos]);
    e.target.value = "";
  };

  const removePhoto = (index) => {
    setError("");
    onChange(photos.filter((_, i) => i !== index));
  };

  const isAtMax = photos.length >= maxPhotos;

  return (
    <div>
      {/* Upload area — hidden when max reached */}
      {!isAtMax && (
        <div
          className={`border border-2 rounded-3 text-center py-4 mb-3 ${disabled ? "opacity-50" : ""}`}
          style={{
            cursor:      disabled ? "not-allowed" : "pointer",
            borderStyle: "dashed",
            borderColor: "#0d6efd",
          }}
          onClick={() => !disabled && fileRef.current.click()}
        >
          <i className="bi bi-cloud-upload text-primary fs-2 d-block mb-2" />
          <div className="fw-semibold text-primary">Click to upload photos</div>
          <div className="text-muted small mt-1">
            {photos.length}/{maxPhotos} photos · JPG, PNG, WEBP · max {MAX_SIZE_MB}MB each
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            className="d-none"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
      )}

      {/* Max reached banner */}
      {isAtMax && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3">
          <i className="bi bi-check-circle-fill" />
          <span className="small">
            Maximum {maxPhotos} photos added.
            <button
              className="btn btn-link btn-sm p-0 ms-2 text-success"
              onClick={() => { setError(""); onChange([]); }}
              disabled={disabled}
            >
              Clear all
            </button>
          </span>
        </div>
      )}

      {/* Validation error */}
      {error && (
        <div className="alert alert-warning d-flex align-items-center gap-2 py-2 mb-3">
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
          <span className="small">{error}</span>
          <button className="btn-close btn-close-sm ms-auto" onClick={() => setError("")} />
        </div>
      )}

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="row g-3">
          {photos.map((photo, i) => (
            <div key={i} className="col-4">
              <div className="position-relative">
                <img
                  src={photo.preview}
                  alt={photo.name}
                  className="rounded-3 w-100"
                  style={{ height: 120, objectFit: "cover" }}
                />
                {/* Remove button */}
                {!disabled && (
                  <button
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle p-0 d-flex align-items-center justify-content-center"
                    style={{ width: 24, height: 24, fontSize: 12 }}
                    onClick={() => removePhoto(i)}
                    title="Remove photo"
                  >
                    <i className="bi bi-x" />
                  </button>
                )}
                {/* Photo counter badge */}
                <span
                  className="position-absolute bottom-0 start-0 m-1 badge bg-dark bg-opacity-75"
                  style={{ fontSize: 10 }}
                >
                  {i + 1}/{maxPhotos}
                </span>
                <div className="text-muted text-truncate mt-1" style={{ fontSize: 11 }}>
                  {photo.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
