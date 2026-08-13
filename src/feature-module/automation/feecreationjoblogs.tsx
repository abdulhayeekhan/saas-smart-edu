import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../router/all_routes";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { FeeCreationGetJobLogs } from "../../store/apps/fee-creation-job";

const FeeCreationJobLogs = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();
  const { logs, loading } = useSelector((state: RootState) => state.feeCreationJob);

  useEffect(() => {
    dispatch(FeeCreationGetJobLogs());
  }, [dispatch]);

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Fee Creation Job Logs</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="#">Automation</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Job Logs
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
            <div className="mb-2">
              <button
                className="btn btn-primary"
                onClick={() => dispatch(FeeCreationGetJobLogs())}
                disabled={loading}
              >
                <i className="ti ti-refresh me-2"></i>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
            <h4 className="mb-3">Execution History</h4>
          </div>
          <div className="card-body p-0 py-3">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="thead-light">
                  <tr>
                    <th>#</th>
                    <th>Run Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Total Students</th>
                    <th>Success</th>
                    <th>Failure</th>
                    <th>Status</th>
                    <th>Error Message</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && logs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4 text-muted">
                        No logs available.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, index) => (
                      <tr key={log.id}>
                        <td>{index + 1}</td>
                        <td>{new Date(log.runDate).toLocaleDateString()}</td>
                        <td>{new Date(log.startTime).toLocaleTimeString()}</td>
                        <td>{new Date(log.endTime).toLocaleTimeString()}</td>
                        <td>{log.totalStudents}</td>
                        <td>
                          <span className="badge bg-success">{log.successCount}</span>
                        </td>
                        <td>
                          {log.failureCount > 0 ? (
                            <span className="badge bg-danger">{log.failureCount}</span>
                          ) : (
                            <span className="badge bg-success">{log.failureCount}</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              log.status === "Completed"
                                ? "bg-success"
                                : log.status === "Failed"
                                ? "bg-danger"
                                : "bg-warning"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="text-danger">{log.errorMessage || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeCreationJobLogs;
