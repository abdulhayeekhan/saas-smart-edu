import React from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../router/all_routes";

const GovtNotices = () => {
    const routes = all_routes;

    return (
        <div className="page-wrapper">
            <div className="content content-two">
                {/* Page Header */}
                <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                    <div className="my-auto mb-2">
                        <h3 className="page-title mb-1">Govt Notices</h3>
                        <nav>
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to={routes.adminDashboard}>Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item">Announcement</li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    Govt Notices
                                </li>
                            </ol>
                        </nav>
                    </div>
                </div>
                {/* /Page Header */}

                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-body text-center p-5">
                                <div className="mb-4">
                                    <i className="ti ti-external-link fs-48 text-primary" style={{ fontSize: '64px' }}></i>
                                </div>
                                <h4 className="mb-3">Official Govt Notifications</h4>
                                <p className="text-muted mb-4">
                                    For security reasons, the School Education Department's official notifications 
                                    must be viewed directly on their portal. Click the button below to open the official site.
                                </p>
                                <a 
                                    href="https://schools.punjab.gov.pk/notifications" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="btn btn-primary btn-lg d-inline-flex align-items-center"
                                >
                                    <i className="ti ti-world me-2"></i>
                                    View Official Notifications
                                </a>
                                <div className="mt-5 text-start border-top pt-4">
                                    <h6 className="fw-semibold mb-2">Note:</h6>
                                    <ul className="text-muted small">
                                        <li>This link will open the official School Education Department website in a new tab.</li>
                                        <li>You may need to log in to the government portal if required.</li>
                                        <li>Ensure you are connected to the internet to access the portal.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovtNotices;
