import React, { useState } from "react";
import DefaulterSummaryReport from "./defaulterSummaryReport";
import DefaulterListReport from "./defaulterListReport";

const DefaulterReport = () => {
  const [activeTab, setActiveTab] = useState<"summary" | "list">("summary");

  return (
    <div>
      <div className="d-flex justify-content-end px-4 pt-3 no-print bg-light border-bottom">
        <ul className="nav nav-pills">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "summary" ? "active" : ""}`}
              onClick={() => setActiveTab("summary")}
            >
              <i className="ti ti-chart-pie me-1"></i> Defaulter Summary View
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "list" ? "active" : ""}`}
              onClick={() => setActiveTab("list")}
            >
              <i className="ti ti-list-details me-1"></i> Defaulter List View
            </button>
          </li>
        </ul>
      </div>

      {activeTab === "summary" ? <DefaulterSummaryReport /> : <DefaulterListReport />}
    </div>
  );
};

export default DefaulterReport;
export { DefaulterSummaryReport, DefaulterListReport };
