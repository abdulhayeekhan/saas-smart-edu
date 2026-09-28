import React from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";

const HrVoucher = () => {
  const routes = all_routes;

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <i className="ti ti-chevron-right" />
                    </i>
                  </li>
                  <li className="breadcrumb-item active">HR Voucher</li>
                </ul>
                <h3 className="page-title">HR Voucher</h3>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <p>This is a placeholder for the HR Voucher page. Please provide the fields and layout requirements to complete this page.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HrVoucher;
