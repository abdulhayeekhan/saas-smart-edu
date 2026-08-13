import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Companylogo, CoverPhoto } from '../../../environment';
import CopyrightFooter from "../../../core/common/footer/CopyrightFooter";
import useAuth from "../../../hooks/useAuth";
import { LoginParams } from "../../../context/AuthContext";

type PasswordField = "password";

const Login2 = () => {
  const routes = all_routes;
  const navigation = useNavigate();

  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
  });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const [rememberMe, setRememberMe] = useState(true);
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [data, setData] = useState<LoginParams>({
    username: "",
    password: "",
    rememberMe: true,
  });

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const { username, password } = data;

    try {
      await auth.login({ username, password, rememberMe }, (err: any) => {
        const msg = err?.response?.data?.message || err?.message || "Username or password is incorrect";
        setErrorMessage(msg);
      });
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Username or password is incorrect";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container-fluid p-0 overflow-hidden vh-100 bg-light">
        <div className="row g-0 vh-100">
          
          {/* LEFT SIDE: SIMPLE EDUCATIONAL LOGIN FORM */}
          <div className="col-lg-5 col-xl-4 d-flex flex-column justify-content-between p-4 p-md-5 bg-white vh-100 overflow-auto shadow-sm">
            
            <div className="w-100 my-auto py-2">
              
              {/* School/Company Logo */}
              <div className="mb-4 text-center">
                <ImageWithBasePath
                  src={Companylogo}
                  className="img-fluid"
                  alt="Smart Edu Logo"
                  style={{ maxHeight: "60px" }}
                />
              </div>

              {/* Heading */}
              <div className="mb-4 text-center">
                <h4 className="fw-bold text-dark mb-1">Portal Sign In</h4>
                <p className="text-muted fs-14 mb-0">
                  Please enter your username and password
                </p>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="alert alert-danger py-2 px-3 mb-3 fs-14 rounded d-flex align-items-center justify-content-between" role="alert">
                  <div className="d-flex align-items-center">
                    <i className="ti ti-alert-circle me-2 fs-18"></i>
                    <span>{errorMessage}</span>
                  </div>
                  <button type="button" className="btn-close py-2 ms-2" style={{ fontSize: '10px' }} onClick={() => setErrorMessage(null)}></button>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={onSubmit}>
                
                {/* Username Input */}
                <div className="mb-3">
                  <label className="form-label fw-medium text-dark fs-14 mb-1">
                    Username
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <i className="ti ti-user fs-16" />
                    </span>
                    <input
                      type="text"
                      name="username"
                      value={data.username}
                      onChange={handleInfoChange}
                      placeholder="Enter username"
                      className="form-control fs-14"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="mb-3">
                  <label className="form-label fw-medium text-dark fs-14 mb-1">
                    Password
                  </label>
                  <div className="input-group position-relative">
                    <span className="input-group-text bg-light text-muted">
                      <i className="ti ti-lock fs-16" />
                    </span>
                    <input
                      type={passwordVisibility.password ? "text" : "password"}
                      name="password"
                      value={data.password}
                      onChange={handleInfoChange}
                      placeholder="Enter password"
                      className="form-control fs-14 pe-5"
                      required
                    />
                    <button
                      type="button"
                      className="btn border-0 text-muted position-absolute end-0 top-50 translate-middle-y z-3"
                      onClick={() => togglePasswordVisibility("password")}
                      style={{ background: "transparent" }}
                    >
                      <i className={`ti ${passwordVisibility.password ? "ti-eye" : "ti-eye-off"} fs-16`} />
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="form-check d-flex align-items-center mb-0">
                    <input
                      className="form-check-input mt-0 cursor-pointer"
                      type="checkbox"
                      id="rememberMeCheck"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label ms-2 fs-13 text-secondary cursor-pointer" htmlFor="rememberMeCheck">
                      Remember Me
                    </label>
                  </div>
                  <div>
                    <Link
                      to={routes.forgotPassword}
                      className="text-primary fw-medium fs-13 text-decoration-none"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mb-3">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fs-15 fw-semibold shadow-sm"
                    disabled={isLoading || !rememberMe}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </button>
                </div>
              </form>

            </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <CopyrightFooter />
            </div>

          </div>

          {/* RIGHT SIDE: FEATURED IMAGE WITH GRADIENT EFFECT */}
          <div
            className="col-lg-7 col-xl-8 d-none d-lg-flex flex-column align-items-center justify-content-center p-5 text-center position-relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(1, 65, 28, 0.78) 0%, rgba(15, 23, 42, 0.75) 50%, rgba(1, 65, 28, 0.85) 100%), url("/assets/img/authentication/login-2-bg.jpg")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Ambient Radial Gradient Blur */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                background: "radial-gradient(circle at top right, rgba(13, 138, 78, 0.4), transparent 60%)",
                pointerEvents: "none",
              }}
            />

            {/* Glassmorphism Overlay Card */}
            <div
              className="px-4 py-5 rounded-4 position-relative z-1 text-white shadow-lg"
              style={{
                maxWidth: "580px",
                background: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.22)",
              }}
            >
              <div className="mb-3 d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-white bg-opacity-20 border border-white border-opacity-25 text-warning fs-13 fw-semibold">
                <i className="ti ti-sparkles" /> Smart Edu Digital Campus
              </div>
              <h2 className="fw-bold text-white mb-3 display-6">
                Smart Edu Management Portal
              </h2>
              <p className="text-white opacity-90 fs-15 mb-4 leading-relaxed">
                Empowering schools, teachers, students, and parents with an integrated, next-generation digital learning ecosystem.
              </p>
              
              <div className="d-flex align-items-center justify-content-center gap-4 pt-3 border-top border-white border-opacity-20">
                <div className="text-center">
                  <h5 className="fw-bold text-white mb-0">100%</h5>
                  <small className="text-white opacity-75 fs-12">Digital Workflows</small>
                </div>
                <div className="vr bg-white opacity-25" style={{ height: "30px" }} />
                <div className="text-center">
                  <h5 className="fw-bold text-white mb-0">Real-Time</h5>
                  <small className="text-white opacity-75 fs-12">Campus Insights</small>
                </div>
                <div className="vr bg-white opacity-25" style={{ height: "30px" }} />
                <div className="text-center">
                  <h5 className="fw-bold text-white mb-0">Secure</h5>
                  <small className="text-white opacity-75 fs-12">Cloud Portal</small>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default Login2;
