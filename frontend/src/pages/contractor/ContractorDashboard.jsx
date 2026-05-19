import { useState } from "react";
import ContractorSidebar    from "../../components/ContractorSidebar";
import MaintenanceRequests  from "./MaintenanceRequests";
import MyJobs               from "./MyJobs";
import Ratings              from "./Ratings";
import PastJobHistory       from "./PastJobHistory";

export default function ContractorDashboard() {
  const [active, setActive] = useState("requests");

  return (
    <div className="d-flex" style={{ minHeight: "calc(100vh - 56px)" }}>
      <ContractorSidebar active={active} onSelect={setActive} />

      <div className="flex-grow-1 overflow-y-auto bg-light">
        {active === "requests" && <MaintenanceRequests />}
        {active === "myjobs"   && <MyJobs />}
        {active === "ratings"  && <Ratings />}
        {active === "pastjobs" && <PastJobHistory />}
      </div>
    </div>
  );
}
