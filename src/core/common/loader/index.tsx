import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Assuming you're using React Router
import { all_routes } from "../../../feature-module/router/all_routes";

const Loader = () => {
  const routes = all_routes
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
      

    if (location.pathname === routes.adminDashboard || location.pathname === routes.teacherDashboard 
      || location.pathname === routes.studentDashboard || location.pathname === routes.parentDashboard 
    ) {
      
      // Show the loader when navigating to a new route
      setShowLoader(true);

      // Hide the loader after 2 seconds
      const timeoutId = setTimeout(() => {
        setShowLoader(false);
      }, 2000);

      return () => {
        clearTimeout(timeoutId); // Clear the timeout when component unmounts
      };
    }else {
      setShowLoader(false)
    }
  }, [location.pathname]);

  return (
    <>
      {showLoader && <Preloader />}
      <div>
        {/* Your other content goes here */}
      </div>
    </>
  );
};

const Preloader = () => {
  return (
    <div id="global-loader" style={{ background: "#ffffff", zIndex: 999999 }}>
      <div className="d-flex flex-column align-items-center justify-content-center">
        <img
          src="/assets/img/loader.svg"
          alt="Smart Edu Loading..."
          style={{ width: "110px", height: "110px" }}
        />
        <div className="mt-3 fw-bold fs-16 d-flex align-items-center gap-2">
          <span style={{ color: "#7C3AED" }}>Smart Edu</span>
          <span className="text-muted fw-normal fs-14">Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default Loader;
