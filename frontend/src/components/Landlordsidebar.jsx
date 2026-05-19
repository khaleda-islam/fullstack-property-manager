import NotificationPanel from "./NotificationPanel";

const SIDEBAR_ITEMS = [
  { key: "properties", icon: "bi-building",       label: "Property Dashboard" },
  { key: "completed",  icon: "bi-clipboard-check", label: "Completed Requests" },
];

export default function LandlordSidebar({ active, onSelect }) {
  return (
    <div
      className="d-flex flex-column bg-white border-end shadow-sm flex-shrink-0"
      style={{ width: 230 }}
    >
      {/* Header */}
      <div className="px-3 py-3 border-bottom">
        <div className="fw-bold text-primary">
          <i className="bi bi-speedometer2 me-2" />My Dashboard
        </div>
        <div className="text-muted" style={{ fontSize: 11 }}>Landlord Portal</div>
      </div>

      {/* Nav items */}
      <nav className="flex-grow-1 py-2">
        {SIDEBAR_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`d-flex align-items-center gap-2 w-100 px-3 py-2 border-0 text-start fw-medium
              ${active === item.key
                ? "bg-primary bg-opacity-10 text-primary border-start border-3 border-primary"
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

      {/* Footer */}
      <div className="px-3 py-3 border-top">
        <small className="text-muted">
          <i className="bi bi-info-circle me-1" />Landlord view only
        </small>
      </div>
    </div>
  );
}
