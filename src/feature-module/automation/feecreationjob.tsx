import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { all_routes } from "../router/all_routes";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  FeeCreationGetJobSetting,
  FeeCreationUpdateJobSetting,
  FeeCreationJobSetting
} from "../../store/apps/fee-creation-job";

const FeeCreationJob = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();

  const { setting, loading } = useSelector(
    (state: RootState) => state.feeCreationJob
  );

  const [form, setForm] = useState<FeeCreationJobSetting>({
    id: 0,
    runTime: "00:00:00",
    dayOfMonth: 1,
    isEnabled: false,
    dueDays: 10,
    userId: 0,
    lastRunDate: null
  });

  useEffect(() => {
    dispatch(FeeCreationGetJobSetting());
  }, [dispatch]);

  useEffect(() => {
    if (setting) {
      setForm(setting);
    }
  }, [setting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === "dayOfMonth" || name === "dueDays") {
      setForm({ ...form, [name]: Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.dayOfMonth < 1 || form.dayOfMonth > 31) {
      toast.error("Day of month must be between 1 and 31");
      return;
    }
    if (form.dueDays < 0) {
      toast.error("Due days must be positive");
      return;
    }

    const payload = { ...form };
    
    if (payload.runTime && payload.runTime.length === 5) {
        payload.runTime = payload.runTime + ":00";
    }

    await dispatch(FeeCreationUpdateJobSetting(payload));
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Fee Creation Job Settings</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="#">Automation</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Fee Creation Job
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Configure Auto Fee Generation</h4>
          </div>
          <div className="card-body">
            {loading && !setting ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Run Time <span className="text-danger">*</span></label>
                    <input
                      type="time"
                      className="form-control"
                      name="runTime"
                      value={form.runTime}
                      onChange={handleChange}
                      step="1"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Day of Month <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      name="dayOfMonth"
                      value={form.dayOfMonth}
                      onChange={handleChange}
                      min="1"
                      max="31"
                      required
                    />
                    <small className="text-muted">The day of every month this job will run (1-31).</small>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Due Days <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      name="dueDays"
                      value={form.dueDays}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                    <small className="text-muted">Number of days after generation until the invoice is due.</small>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Last Run Date</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.lastRunDate ? new Date(form.lastRunDate).toLocaleString() : "Never"}
                      disabled
                    />
                  </div>

                  <div className="col-md-12 mb-3">
                    <div className="form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isEnabled"
                        name="isEnabled"
                        checked={form.isEnabled}
                        onChange={handleChange}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="isEnabled">
                        Enable Automation Job
                      </label>
                    </div>
                  </div>
                </div>

                <div className="text-end">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeCreationJob;
