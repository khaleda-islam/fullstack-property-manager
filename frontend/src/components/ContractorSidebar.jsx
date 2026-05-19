import NotificationPanel from "./NotificationPanel";

const SIDEBAR_ITEMS = [
  { key: "requests",  icon: "bi-tools",          label: "Maintenance Requests" },
  { key: "myjobs",    icon: "bi-briefcase",       label: "My Jobs"              },
  { key: "ratings",   icon: "bi-star",            label: "Ratings"              },
  { key: "pastjobs",  icon: "bi-clock-history",   label: "Past Job History"     },
];

export default function ContractorSidebar({ active, onSelect }) {
  return (
    <div
      className="d-flex flex-column bg-white border-end shadow-sm flex-shrink-0"
      style={{ width: 230 }}
    >
      <div className="px-3 py-3 border-bottom">
        <div className="fw-bold text-warning">
          <i className="bi bi-speedometer2 me-2" />My Dashboard
        </div>
        <div className="text-muted" style={{ fontSize: 11 }}>Contractor Portal</div>
      </div>

      <nav className="flex-grow-1 py-2">
        {SIDEBAR_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`d-flex align-items-center gap-2 w-100 px-3 py-2 border-0 text-start fw-medium
              ${active === item.key
                ? "bg-warning bg-opacity-10 text-warning border-start border-3 border-warning"
                : "bg-transparent text-muted"}`}
            style={{ fontSize: 14 }}
            onClick={() => onSelect(item.key)}
          >
            <i className={`bi ${item.icon}`} />
            {item.label}
          </button>
        ))}

        {/* Notifications */}
        <NotificationPanel />
      </nav>

      <div className="px-3 py-3 border-top">
        <small className="text-muted">
          <i className="bi bi-info-circle me-1" />Contractor view only
        </small>
      </div>
    </div>
  );
}
