import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  login,
  registerUser,
  clearAuthError,
} from "../../store/slices/authSlice";
import "./Login.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector(
    (state) => state.auth
  );

  const [isRegistering, setIsRegistering] = useState(false);

  // =========================
  // LOGIN STATE
  // =========================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loginFieldErrors, setLoginFieldErrors] = useState({
    email: "",
    password: "",
  });

  // =========================
  // REGISTER STATE
  // =========================

  const [fullName, setFullName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] =
    useState(false);

  const [role, setRole] = useState("ROLE_GOAL_OWNER");
  const [department, setDepartment] = useState("");

  const [registerFieldErrors, setRegisterFieldErrors] =
    useState({
      fullName: "",
      email: "",
      password: "",
      role: "",
      department: "",
    });

  // =========================
  // LOGIN VALIDATION
  // =========================

  const validateLogin = () => {
    const errors = {
      email: "",
      password: "",
    };

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      errors.email =
        "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setLoginFieldErrors(errors);

    return !errors.email && !errors.password;
  };

  // =========================
  // REGISTER VALIDATION
  // =========================

  const validateRegistration = () => {
    const errors = {
      fullName: "",
      email: "",
      password: "",
      role: "",
      department: "",
    };

    if (!fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!registerEmail.trim()) {
      errors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        registerEmail.trim()
      )
    ) {
      errors.email =
        "Please enter a valid email address";
    }

    if (!registerPassword) {
      errors.password = "Password is required";
    } else if (registerPassword.length < 6) {
      errors.password =
        "Password must be at least 6 characters";
    }

    if (
      role !== "ROLE_GOAL_OWNER" &&
      role !== "ROLE_TEAM_LEAD"
    ) {
      errors.role = "Please select a valid role";
    }

    if (!department.trim()) {
      errors.department =
        "Department is required";
    }

    setRegisterFieldErrors(errors);

    return !Object.values(errors).some(
      (value) => value
    );
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateLogin()) {
      return;
    }

    const result = await dispatch(
      login({
        email: email.trim(),
        password,
      })
    );

    if (!login.rejected.match(result)) {
      navigate("/");
    }
  };

  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateRegistration()) {
      return;
    }

    /*
     * Only GOAL_OWNER and TEAM_LEAD can be
     * registered from the public registration form.
     */

    const result = await dispatch(
      registerUser({
        fullName: fullName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        role,
        department: department.trim(),
      })
    );

    if (!registerUser.rejected.match(result)) {
      const registeredEmail = registerEmail.trim();

      setFullName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setShowRegisterPassword(false);
      setRole("ROLE_GOAL_OWNER");
      setDepartment("");

      setRegisterFieldErrors({
        fullName: "",
        email: "",
        password: "",
        role: "",
        department: "",
      });

      setIsRegistering(false);

      dispatch(clearAuthError());

      setEmail(registeredEmail);
    }
  };

  // =========================
  // SWITCH TO REGISTER
  // =========================

  const switchToRegister = () => {
    dispatch(clearAuthError());

    setLoginFieldErrors({
      email: "",
      password: "",
    });

    setShowPassword(false);

    setIsRegistering(true);
  };

  // =========================
  // SWITCH TO LOGIN
  // =========================

  const switchToLogin = () => {
    dispatch(clearAuthError());

    setRegisterFieldErrors({
      fullName: "",
      email: "",
      password: "",
      role: "",
      department: "",
    });

    setShowRegisterPassword(false);

    setIsRegistering(false);
  };

  return (
    <div className="login-page">
      <div
        className={`login-card ${
          isRegistering
            ? "register-card"
            : ""
        }`}
      >
        {/* =========================
            HEADER
        ========================= */}

        <div className="login-card-header">
          <div className="login-logo">P</div>

          <h1>PeakPerform</h1>

          <p>
            {isRegistering
              ? "Create an account to start managing performance."
              : "Sign in to manage your objectives and track performance."}
          </p>
        </div>

        {!isRegistering ? (
          // =========================
          // LOGIN FORM
          // =========================
          <form
            onSubmit={handleLogin}
            noValidate
          >
            {/* EMAIL */}

            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                type="email"
                name="email"
                id="email"
                placeholder="e.g. priya@peakperform.io"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);

                  if (loginFieldErrors.email) {
                    setLoginFieldErrors((prev) => ({
                      ...prev,
                      email: "",
                    }));
                  }

                  if (error) {
                    dispatch(clearAuthError());
                  }
                }}
                disabled={loading}
                autoComplete="email"
              />

              {loginFieldErrors.email && (
                <span className="field-error">
                  {loginFieldErrors.email}
                </span>
              )}
            </div>

            {/* PASSWORD */}

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="password-input-wrapper">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  id="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);

                    if (
                      loginFieldErrors.password
                    ) {
                      setLoginFieldErrors(
                        (prev) => ({
                          ...prev,
                          password: "",
                        })
                      );
                    }

                    if (error) {
                      dispatch(clearAuthError());
                    }
                  }}
                  disabled={loading}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  title={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 3l18 18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 8.8 4.2 10 7-0.5 1.2-1.5 2.8-3 4.2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6.1 6.1C4.1 7.4 2.7 9.5 2 12c1.2 2.8 4.8 7 10 7 1 0 2-.2 2.9-.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {loginFieldErrors.password && (
                <span className="field-error">
                  {
                    loginFieldErrors.password
                  }
                </span>
              )}
            </div>

            {/* ERROR */}

            {error && (
              <div className="alert-error">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              id="login-submit-btn"
              className="btn-primary btn-full"
              disabled={loading}
            >
              {loading
                ? "Signing in ..."
                : "Sign In"}
            </button>

            {/* REGISTER SWITCH */}

            <div className="auth-switch">
              <span>
                Don't have an account?
              </span>

              <button
                type="button"
                className="auth-switch-btn"
                onClick={switchToRegister}
                disabled={loading}
              >
                Create Account
              </button>
            </div>
          </form>
        ) : (
          // =========================
          // REGISTER FORM
          // =========================
          <form
            onSubmit={handleRegister}
            noValidate
          >
            {/* FULL NAME */}

            <div className="form-group">
              <label htmlFor="fullName">
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                id="fullName"
                placeholder="e.g. Priya Sharma"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);

                  if (
                    registerFieldErrors.fullName
                  ) {
                    setRegisterFieldErrors(
                      (prev) => ({
                        ...prev,
                        fullName: "",
                      })
                    );
                  }

                  if (error) {
                    dispatch(clearAuthError());
                  }
                }}
                disabled={loading}
                autoComplete="name"
              />

              {registerFieldErrors.fullName && (
                <span className="field-error">
                  {
                    registerFieldErrors.fullName
                  }
                </span>
              )}
            </div>

            {/* EMAIL */}

            <div className="form-group">
              <label htmlFor="registerEmail">
                Email
              </label>

              <input
                type="email"
                name="registerEmail"
                id="registerEmail"
                placeholder="e.g. priya@peakperform.io"
                value={registerEmail}
                onChange={(e) => {
                  setRegisterEmail(
                    e.target.value
                  );

                  if (
                    registerFieldErrors.email
                  ) {
                    setRegisterFieldErrors(
                      (prev) => ({
                        ...prev,
                        email: "",
                      })
                    );
                  }

                  if (error) {
                    dispatch(clearAuthError());
                  }
                }}
                disabled={loading}
                autoComplete="email"
              />

              {registerFieldErrors.email && (
                <span className="field-error">
                  {
                    registerFieldErrors.email
                  }
                </span>
              )}
            </div>

            {/* PASSWORD */}

            <div className="form-group">
              <label htmlFor="registerPassword">
                Password
              </label>

              <div className="password-input-wrapper">
                <input
                  type={
                    showRegisterPassword
                      ? "text"
                      : "password"
                  }
                  name="registerPassword"
                  id="registerPassword"
                  placeholder="At least 6 characters"
                  value={registerPassword}
                  onChange={(e) => {
                    setRegisterPassword(
                      e.target.value
                    );

                    if (
                      registerFieldErrors.password
                    ) {
                      setRegisterFieldErrors(
                        (prev) => ({
                          ...prev,
                          password: "",
                        })
                      );
                    }

                    if (error) {
                      dispatch(clearAuthError());
                    }
                  }}
                  disabled={loading}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowRegisterPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showRegisterPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  title={
                    showRegisterPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                >
                  {showRegisterPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 3l18 18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 8.8 4.2 10 7-0.5 1.2-1.5 2.8-3 4.2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6.1 6.1C4.1 7.4 2.7 9.5 2 12c1.2 2.8 4.8 7 10 7 1 0 2-.2 2.9-.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {registerFieldErrors.password && (
                <span className="field-error">
                  {
                    registerFieldErrors.password
                  }
                </span>
              )}
            </div>

            {/* ROLE */}

            <div className="form-group">
              <label htmlFor="role">
                Role
              </label>

              <select
                name="role"
                id="role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);

                  if (
                    registerFieldErrors.role
                  ) {
                    setRegisterFieldErrors(
                      (prev) => ({
                        ...prev,
                        role: "",
                      })
                    );
                  }
                }}
                disabled={loading}
              >
                <option value="ROLE_GOAL_OWNER">
                  Goal Owner
                </option>

                <option value="ROLE_TEAM_LEAD">
                  Team Lead
                </option>
              </select>

              {registerFieldErrors.role && (
                <span className="field-error">
                  {registerFieldErrors.role}
                </span>
              )}
            </div>

            {/* DEPARTMENT */}

            <div className="form-group">
              <label htmlFor="department">
                Department
              </label>

              <input
                type="text"
                name="department"
                id="department"
                placeholder="e.g. Engineering"
                value={department}
                onChange={(e) => {
                  setDepartment(
                    e.target.value
                  );

                  if (
                    registerFieldErrors.department
                  ) {
                    setRegisterFieldErrors(
                      (prev) => ({
                        ...prev,
                        department: "",
                      })
                    );
                  }

                  if (error) {
                    dispatch(clearAuthError());
                  }
                }}
                disabled={loading}
              />

              {registerFieldErrors.department && (
                <span className="field-error">
                  {
                    registerFieldErrors.department
                  }
                </span>
              )}
            </div>

            {/* ERROR */}

            {error && (
              <div className="alert-error">
                {error}
              </div>
            )}

            {/* REGISTER BUTTON */}

            <button
              type="submit"
              className="btn-primary btn-full"
              disabled={loading}
            >
              {loading
                ? "Creating Account ..."
                : "Create Account"}
            </button>

            {/* LOGIN SWITCH */}

            <div className="auth-switch">
              <span>
                Already have an account?
              </span>

              <button
                type="button"
                className="auth-switch-btn"
                onClick={switchToLogin}
                disabled={loading}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;