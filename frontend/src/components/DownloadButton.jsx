// ── Usage ─────────────────────────────────────────────────────────────────────
//
// <DownloadButton url={leaseDocument.url} fileName="lease.pdf" />
//
// Props:
//   url        — file URL (Cloudinary or any)
//   fileName   — downloaded file name
//   label      — button text (default: "Download PDF")
//   variant    — Bootstrap button variant (default: "outline-danger")
//   size       — "sm" | "" (default: "")
//   icon       — Bootstrap icon class (default: "bi-download")
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

const downloadFile = async (url, fileName) => {
  const res  = await fetch(url);
  const blob = await res.blob();
  const link = document.createElement("a");
  link.href     = URL.createObjectURL(blob);
  link.download = fileName || "file";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export default function DownloadButton({
  url      = "",
  fileName = "file.pdf",
  label    = "Download PDF",
  variant  = "outline-danger",
  size     = "",
  icon     = "bi-download",
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!url) return;
    setLoading(true);
    try {
      await downloadFile(url, fileName);
    } catch {
      // Fallback — open in new tab
      window.open(url, "_blank");
    } finally {
      setLoading(false);
    }
  };

  if (!url) return null;

  return (
    <button
      className={`btn btn-${variant} ${size ? `btn-${size}` : ""}`}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <><span className="spinner-border spinner-border-sm me-2" />Downloading...</>
      ) : (
        <><i className={`bi ${icon} me-2`} />{label}</>
      )}
    </button>
  );
}
