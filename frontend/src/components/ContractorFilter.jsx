// ── Usage ─────────────────────────────────────────────────────────────────────
// <ContractorFilter
//   filters={filters}
//   onChange={setFilters}
//   onSearch={handleSearch}
//   loading={loading}
// />
//
// filters shape: { jobType: "", city: "", ratingRange: { label, min, max } }
// ─────────────────────────────────────────────────────────────────────────────

import { JOB_TYPES } from "./ProfileEditModal";
import CANADIAN_CITIES from "../constants/canadianCities";

export const RATING_RANGES = [
  { label: "All Ratings", min: 0,  max: 10 },
  { label: "⭐ 0 – 2",    min: 0,  max: 2  },
  { label: "⭐ 2 – 4",    min: 2,  max: 4  },
  { label: "⭐ 4 – 6",    min: 4,  max: 6  },
  { label: "⭐ 6 – 8",    min: 6,  max: 8  },
  { label: "⭐ 8 – 10",   min: 8,  max: 10 },
];

export const DEFAULT_FILTERS = {
  jobType:     "",
  city:        "",
  ratingRange: RATING_RANGES[0],
};

export default function ContractorFilter({
  filters  = DEFAULT_FILTERS,
  onChange = () => {},
  onSearch = () => {},
  loading  = false,
}) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  const handleReset = () => onChange(DEFAULT_FILTERS);

  const hasActiveFilters =
    filters.jobType !== "" ||
    filters.city    !== "" ||
    filters.ratingRange.label !== "All Ratings";

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-transparent border-bottom py-2 px-4 d-flex align-items-center justify-content-between">
        <span className="fw-semibold small">
          <i className="bi bi-funnel me-1" />Filter Contractors
        </span>
        {hasActiveFilters && (
          <button
            className="btn btn-link btn-sm p-0 text-muted text-decoration-none"
            style={{ fontSize: 11 }}
            onClick={handleReset}
          >
            <i className="bi bi-x-circle me-1" />Reset
          </button>
        )}
      </div>

      <div className="card-body p-3">
        <div className="row g-3 align-items-end">

          {/* Job Type */}
          <div className="col-md-4">
            <label className="form-label fw-semibold small mb-1">
              <i className="bi bi-tools me-1 text-warning" />Job Type
            </label>
            <select
              className="form-select form-select-sm"
              value={filters.jobType}
              onChange={(e) => set("jobType", e.target.value)}
            >
              <option value="">All Types</option>
              {JOB_TYPES.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="col-md-4">
            <label className="form-label fw-semibold small mb-1">
              <i className="bi bi-geo-alt me-1 text-danger" />City
            </label>
            <select
              className="form-select form-select-sm"
              value={filters.city}
              onChange={(e) => set("city", e.target.value)}
            >
              <option value="">All Cities</option>
              {CANADIAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Rating Range */}
          <div className="col-md-4">
            <label className="form-label fw-semibold small mb-1">
              <i className="bi bi-star me-1 text-warning" />Rating Range
            </label>
            <select
              className="form-select form-select-sm"
              value={filters.ratingRange.label}
              onChange={(e) =>
                set("ratingRange", RATING_RANGES.find((r) => r.label === e.target.value))
              }
            >
              {RATING_RANGES.map((r) => (
                <option key={r.label} value={r.label}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Active filter badges */}
          {hasActiveFilters && (
            <div className="col-12 d-flex gap-2 flex-wrap">
              {filters.jobType && (
                <span className="badge bg-warning text-dark">
                  <i className="bi bi-tools me-1" />{filters.jobType}
                  <button
                    className="btn-close btn-close-sm ms-1"
                    style={{ fontSize: 8 }}
                    onClick={() => set("jobType", "")}
                  />
                </span>
              )}
              {filters.city && (
                <span className="badge bg-danger">
                  <i className="bi bi-geo-alt me-1" />{filters.city}
                  <button
                    className="btn-close btn-close-sm ms-1"
                    style={{ fontSize: 8 }}
                    onClick={() => set("city", "")}
                  />
                </span>
              )}
              {filters.ratingRange.label !== "All Ratings" && (
                <span className="badge bg-primary">
                  {filters.ratingRange.label}
                  <button
                    className="btn-close btn-close-sm ms-1"
                    style={{ fontSize: 8 }}
                    onClick={() => set("ratingRange", RATING_RANGES[0])}
                  />
                </span>
              )}
            </div>
          )}

          {/* Search button */}
          <div className="col-12 d-flex justify-content-end">
            <button
              className="btn btn-primary btn-sm px-4"
              onClick={onSearch}
              disabled={loading}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Searching...</>
                : <><i className="bi bi-search me-1" />Search</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

