import React, { useState, ChangeEvent } from 'react';
import { Link } from "react-router-dom";

// --- TYPE DEFINITIONS ---
interface AuditFormData {
  schoolBranch: string;
  auditPeriod: string;
  submissionDate: string;
}

const SchoolFinancialAudit: React.FC = () => {
  // State typed with the interface
  const [formData, setFormData] = useState<AuditFormData>({
    schoolBranch: 'Dar-e-Arqam - Main Campus',
    auditPeriod: 'FY 2024-2025',
    submissionDate: new Date().toISOString().split('T')[0],
  });

  // Example handler for inputs (can be expanded as you add state for all fields)
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <Link
          to="#"
          className="btn btn-primary d-flex align-items-center"
          data-bs-toggle="modal"
          data-bs-target="#add_audit_data"
        >
          <i className="ti ti-square-rounded-plus me-2" />
          CREATE FINANCIAL AUDIT REPORT
        </Link>
        <div className="modal fade" id="add_audit_data">
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              {/* --- HEADER --- */}
              <div className="modal-header border-bottom-4 border-emerald-600">
                <h4 className="modal-title fw-bold text-success">CAMPUS FINANCIAL AUDIT</h4>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>

              <div className="modal-body bg-light">
                {/* --- SECTION 1: EQUITY --- */}
                <div className="card mb-3 shadow-sm border-0">
                  <div className="card-body">
                    <h6 className="fw-bold d-flex align-items-center gap-2">
                      <i className="ti ti-users fs-4 text-success"></i> 1. Equity Details
                    </h6>
                    <hr />
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">Authorized Capital</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">Paid-up Capital</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">Retained Earnings (Prev. Years)</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                      {/* Add other inputs here... */}
                    </div>
                  </div>
                </div>


                {/* --- SECTION 2: Revenue Stream (Fee Heads) --- */}
                <div className="card mb-3 shadow-sm border-0">
                  <div className="card-body">
                    <h6 className="fw-bold d-flex align-items-center gap-2">
                      <i className="ti ti-chart-arrows-vertical fs-4 text-success"></i> 2. Revenue Stream (Fee Heads)
                    </h6>
                    <hr />
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted d-flex align-items-center gap-2">
                          {/* Using Tabler Icon instead of Lucide DollarSign */}
                          <i className="ti ti-coin text-success"></i>
                          Tuition Fees
                        </label>
                        <div className="d-flex gap-2">
                          <div className="input-group">
                            <span className="input-group-text">Rs</span>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Gross"
                            />
                          </div>
                          <div className="input-group">
                            <span className="input-group-text">Rs</span>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Net"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="small fw-bold text-muted d-flex align-items-center gap-2">
                          {/* Using Tabler Icon instead of Lucide DollarSign */}
                          <i className="ti ti-coin text-success"></i>
                          Admission Fees (Non-Refundable)
                        </label>
                        <div className="d-flex gap-2">
                          <div className="input-group">
                            <span className="input-group-text">Rs</span>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Gross"
                            />
                          </div>
                          <div className="input-group">
                            <span className="input-group-text">Rs</span>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Net"
                            />
                          </div>
                        </div>
                      </div>


                      <div className="col-md-6">
                        <label className="small fw-bold text-muted d-flex align-items-center gap-2">
                          {/* Using Tabler Icon instead of Lucide DollarSign */}
                          <i className="ti ti-coin text-success"></i>
                          Annual Resource Charges
                        </label>
                        <div className="d-flex gap-2">
                          <div className="input-group">
                            <span className="input-group-text">Rs</span>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Gross"
                            />
                          </div>
                          <div className="input-group">
                            <span className="input-group-text">Rs</span>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Net"
                            />
                          </div>
                        </div>
                      </div>


                      <div className="col-md-6">
                        <label className="small fw-bold text-muted d-flex align-items-center gap-2">
                          {/* Using Tabler Icon instead of Lucide DollarSign */}
                          <i className="ti ti-coin text-success"></i>
                          Other (Books/Uniforms/Canteen)
                        </label>
                        <div className="d-flex gap-2">
                          <div className="input-group">
                            <span className="input-group-text">Rs</span>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Gross"
                            />
                          </div>
                          <div className="input-group">
                            <span className="input-group-text">Rs</span>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Net"
                            />
                          </div>
                        </div>
                      </div>


                    </div>
                  </div>
                </div>




                {/* --- Operational Expenses --- */}
                <div className="card mb-3 shadow-sm border-0">
                  <div className="card-body">
                    <h6 className="fw-bold d-flex align-items-center gap-2">
                      <i className="ti ti-receipt-tax fs-4 text-success"></i> 3. Operational Expenses
                    </h6>
                    <hr />
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">Salaries (Teaching Staff)</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">Salaries (Admin/Support)</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">Building Rent / Lease</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">Utilities (Electric/Generator/Net)</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>

                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">Maintenance & Repairs</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">Marketing & Events</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                      {/* Add other inputs here... */}
                    </div>
                  </div>
                </div>

                {/* ---4. Assets Management (Position) --- */}
                <div className="card mb-3 shadow-sm border-0">
                  <div className="card-header">
                    <h6 className="fw-bold d-flex align-items-center gap-2">
                      <i className="ti ti-building-skyscraper fs-4 text-success"></i> 4. Assets Management (Position)
                    </h6>
                  </div>
                  {/* --- SECTION 2: Fixed Assets (Tangible) --- */}
                  <div className="card-body">
                    <h6 className="fw-bold d-flex align-items-center gap-2">
                      <i className="ti ti-layers-intersect fs-4 text-success"></i> Fixed Assets (Tangible)
                    </h6>
                    <hr />
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">Furniture & Fixtures</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">IT Equipment / Computers</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">School Vehicles / Vans</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                    </div>
                  </div>
                  {/* --- SECTION 2: Current Assets --- */}
                  <div className="card-body">
                    <h6 className="fw-bold d-flex align-items-center gap-2">
                      <i className="ti ti-cash-banknote fs-4 text-success"></i> Current Assets
                    </h6>
                    <hr />
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">Cash in Hand</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">Cash at Bank</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                    </div>
                  </div>
                  {/* --- SECTION 2: LIABILITIES --- */}
                  <div className="card-body">
                    <h6 className="fw-bold d-flex align-items-center gap-2">
                      <i className="ti ti-scale fs-4 text-success"></i> Liabilities
                    </h6>
                    <hr />
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">Security Deposits (Refundable)</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">Accrued Expenses (Salaries Payable)</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">Tax Payable (FBR)</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted">Monthly Fund (Head Office 7.5%)</label>
                        <input type="number" className="form-control" placeholder="PKR 0.00" />
                      </div>
                      {/* Add other inputs here... */}
                    </div>
                  </div>
                </div>



                {/* --- SECTION 5: DOCUMENTATION (UPLOAD) --- */}
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <h6 className="fw-bold d-flex align-items-center gap-2">
                      <i className="ti ti-file-description fs-4 text-success"></i> 5. Audit Documentation
                    </h6>
                    <hr />
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="border border-2 border-dashed rounded p-4 text-center bg-white hover-light">
                          <i className="ti ti-upload fs-1 text-muted"></i>
                          <p className="mb-0 mt-2 fw-medium">Upload Bank Statements</p>
                          <span className="text-xs text-muted small">PDF Format (Last 6 Months)</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="border border-2 border-dashed rounded p-4 text-center bg-white hover-light">
                          <i className="ti ti-upload fs-1 text-muted"></i>
                          <p className="mb-0 mt-2 fw-medium">Upload Fixed Asset Register (XLS)</p>
                          <span className="text-xs text-muted small">Excel Format (XLSX)</span>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="border border-2 border-dashed rounded p-4 text-center bg-white hover-light">
                          <i className="ti ti-upload fs-1 text-muted"></i>
                          <p className="mb-0 mt-2 fw-medium">Upload Fee Collection Report</p>
                          <span className="text-xs text-muted small">Detailed Head-wise</span>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="border border-2 border-dashed rounded p-4 text-center bg-white hover-light">
                          <i className="ti ti-upload fs-1 text-muted"></i>
                          <p className="mb-0 mt-2 fw-medium">Upload Rent Agreement / Ownership Docs</p>
                          <span className="text-xs text-muted small">Legal Proofs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light d-flex justify-content-between">
                {/* Left Side: Cancel */}
                <button type="button" className="btn btn-outline-secondary px-4" data-bs-dismiss="modal">
                  <i className="ti ti-x me-1"></i> Cancel
                </button>

                <div className="d-flex gap-2">
                  {/* Middle: Save as Draft */}
                  <button type="button" className="btn btn-warning text-white fw-bold px-4">
                    <i className="ti ti-device-floppy me-1"></i> Save Draft
                  </button>

                  {/* Right Side: Finalize */}
                  <button type="submit" className="btn btn-success fw-bold px-4">
                    <i className="ti ti-circle-check me-1"></i> Finalize & Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolFinancialAudit;