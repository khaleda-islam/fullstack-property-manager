import { useState } from "react";
import LandlordSidebar   from "../../components/Landlordsidebar";
import PropertyDashboard from "./PropertyDashboard";
import CompletedRequests from "./CompletedRequests";

export default function LandlordDashboard1() {
  const [active, setActive] = useState("properties");

  return (
    <div className="d-flex" style={{ minHeight: "calc(100vh - 56px)" }}>
      <LandlordSidebar active={active} onSelect={setActive} />

      <div className="flex-grow-1 overflow-y-auto bg-light">
        {active === "properties" && <PropertyDashboard />}
        {active === "completed"  && <CompletedRequests />}
      </div>
    </div>
  );
}
