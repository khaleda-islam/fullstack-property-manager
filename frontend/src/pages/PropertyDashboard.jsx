import { useState, useEffect } from "react";

// dummy data moved to mock data

const PER_PAGE = 6;

export default function PropertyDashboard() {
  const [page, setPage] = useState(1);
  const [properties, setProperties] = useState([]);

  // fetch function
  useEffect(() => {
    fetch("/mockData/properties.json")
      .then((response) => response.json())
      .then((data) => setProperties(data))
      .catch((error) => console.error("Error fetching properties:", error));
  }, []);

  const totalPages = Math.ceil(PROPERTIES.length / PER_PAGE);
  const paginated = PROPERTIES.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">My Properties</h4>
          <p className="text-muted mb-0 small">
            {PROPERTIES.length} properties total
          </p>
        </div>
        <button className="btn btn-primary btn-sm">
          <i className="bi bi-plus-lg me-1" />
          Add Property
        </button>
      </div>

      {/* Summary stats */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-3 fw-bold text-primary">{PROPERTIES.length}</div>
            <div className="text-muted small">Total Properties</div>
          </div>
        </div>
      </div>

      {/* Property cards */}
      <div className="row g-4 mb-4">
        {paginated.map((p) => (
          <div key={p.id} className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              {/* Property photo */}
              <img
                src={p.img}
                alt={p.name}
                className="card-img-top"
                style={{ height: 180, objectFit: "cover" }}
              />

              <div className="card-body">
                {/* Name + location */}
                <h6 className="fw-bold mb-1">{p.name}</h6>
                <p className="text-muted small mb-3">
                  <i className="bi bi-geo-alt me-1" />
                  {p.location}
                </p>
              </div>

              {/* Card footer */}
              <div className="card-footer bg-transparent border-top-0 pt-0 pb-3 px-3">
                <button className="btn btn-outline-primary btn-sm w-100">
                  <i className="bi bi-eye me-1" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <nav className="d-flex justify-content-center">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setPage(page - 1)}>
              <i className="bi bi-chevron-left" />
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <li key={p} className={`page-item ${page === p ? "active" : ""}`}>
              <button className="page-link" onClick={() => setPage(p)}>
                {p}
              </button>
            </li>
          ))}
          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setPage(page + 1)}>
              <i className="bi bi-chevron-right" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
