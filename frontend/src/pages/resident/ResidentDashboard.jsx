import { useState } from "react";
import ResidentSidebar    from "../../components/ResidentSidebar";
import PropertyDetail     from "./PropertyDetail";
import SubmitMaintenance  from "./SubmitMaintenance";
import MaintenanceStatus  from "./MaintenanceStatus";

export default function ResidentDashboard() {
  const [active, setActive] = useState("property");

  return (
    <div className="d-flex" style={{ minHeight: "calc(100vh - 56px)" }}>
      <ResidentSidebar active={active} onSelect={setActive} />

      <div className="flex-grow-1 overflow-y-auto bg-light">
        {active === "property" && <PropertyDetail />}
        {active === "submit"   && <SubmitMaintenance />}
        {active === "status"   && <MaintenanceStatus />}
      </div>
    </div>
  );
}