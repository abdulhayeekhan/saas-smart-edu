import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { GetConfiguration, UpdateConfiguration, NotificationConfiguration } from "../../../store/apps/notification-configuration";
import { Spin, Select } from "antd";

const NotificationSettings = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector((state: RootState) => state.notificationConfig);

  const [formData, setFormData] = useState<NotificationConfiguration>({
    feeGenerationEnabled: false,
    feeReceiptEnabled: false,
    admissionEnabled: false,
    attendancePresentEnabled: false,
    attendanceAbsentEnabled: false,
    attendanceLeaveEnabled: false,
    feeDefaulterEnabled: false,
    feeDefaulterOccurrence: 1,
    feeDefaulterOccurrenceName: "OneDay",
  });

  useEffect(() => {
    dispatch(GetConfiguration());
  }, [dispatch]);

  useEffect(() => {
    if (data) {
      setFormData({
        feeGenerationEnabled: data.feeGenerationEnabled || false,
        feeReceiptEnabled: data.feeReceiptEnabled || false,
        admissionEnabled: data.admissionEnabled || false,
        attendancePresentEnabled: data.attendancePresentEnabled || false,
        attendanceAbsentEnabled: data.attendanceAbsentEnabled || false,
        attendanceLeaveEnabled: data.attendanceLeaveEnabled || false,
        feeDefaulterEnabled: data.feeDefaulterEnabled || false,
        feeDefaulterOccurrence: data.feeDefaulterOccurrence || 1,
        feeDefaulterOccurrenceName: data.feeDefaulterOccurrenceName || "OneDay",
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSelectChange = (value: number) => {
    const nameMap: Record<number, string> = {
      1: "OneDay",
      2: "TwoDays",
      3: "ThreeDays",
      7: "OneWeek",
      15: "FifteenDays",
      30: "OneMonth"
    };
    setFormData((prev) => ({
      ...prev,
      feeDefaulterOccurrence: value,
      feeDefaulterOccurrenceName: nameMap[value] || "Custom",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(UpdateConfiguration({ ...formData, id: data?.id || 0, modifiedAt: new Date().toISOString() }));
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Notification Settings</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="#">System Settings</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Notification Settings
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <Spin spinning={loading}>
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Configure System Notifications</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-4">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <h6 className="mb-1">Fee Generation</h6>
                              <p className="text-muted mb-0 fs-13">Send notification when fees are generated</p>
                            </div>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                name="feeGenerationEnabled"
                                checked={formData.feeGenerationEnabled}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="form-group mb-4">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <h6 className="mb-1">Fee Receipt</h6>
                              <p className="text-muted mb-0 fs-13">Send notification when fee receipt is generated</p>
                            </div>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                name="feeReceiptEnabled"
                                checked={formData.feeReceiptEnabled}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="form-group mb-4">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <h6 className="mb-1">Admission</h6>
                              <p className="text-muted mb-0 fs-13">Send notification upon new admission</p>
                            </div>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                name="admissionEnabled"
                                checked={formData.admissionEnabled}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group mb-4">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <h6 className="mb-1">Attendance Present</h6>
                              <p className="text-muted mb-0 fs-13">Send notification when marked present</p>
                            </div>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                name="attendancePresentEnabled"
                                checked={formData.attendancePresentEnabled}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="form-group mb-4">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <h6 className="mb-1">Attendance Absent</h6>
                              <p className="text-muted mb-0 fs-13">Send notification when marked absent</p>
                            </div>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                name="attendanceAbsentEnabled"
                                checked={formData.attendanceAbsentEnabled}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="form-group mb-4">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <h6 className="mb-1">Attendance Leave</h6>
                              <p className="text-muted mb-0 fs-13">Send notification on approved leave</p>
                            </div>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                name="attendanceLeaveEnabled"
                                checked={formData.attendanceLeaveEnabled}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <hr />
                    
                    <div className="row mt-3">
                      <div className="col-md-6">
                        <div className="form-group mb-4">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <div>
                              <h6 className="mb-1">Fee Defaulter</h6>
                              <p className="text-muted mb-0 fs-13">Send notification to fee defaulters</p>
                            </div>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                name="feeDefaulterEnabled"
                                checked={formData.feeDefaulterEnabled}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          {formData.feeDefaulterEnabled && (
                            <div className="mt-3">
                              <label className="form-label">Occurrence</label>
                              <Select
                                className="w-100"
                                value={formData.feeDefaulterOccurrence}
                                onChange={handleSelectChange}
                                options={[
                                  { value: 1, label: "One Day" },
                                  { value: 2, label: "Two Days" },
                                  { value: 3, label: "Three Days" },
                                  { value: 7, label: "One Week" },
                                  { value: 15, label: "Fifteen Days" },
                                  { value: 30, label: "One Month" },
                                ]}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-end">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </Spin>
      </div>
    </div>
  );
};

export default NotificationSettings;
