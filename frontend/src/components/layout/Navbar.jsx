import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import "./Navbar.css";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const roles = user?.roles || [];

  const isPerformanceAdmin = roles.includes("ROLE_PERFORMANCE_ADMIN");
  const isGoalOwner = roles.includes("ROLE_GOAL_OWNER");
  const isTeamLead = roles.includes("ROLE_TEAM_LEAD");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `navbar-brand ${isActive ? "active" : ""}`
          }
        >
          Home
        </NavLink>

        {isPerformanceAdmin && (
          <>
            <NavLink
              to="/cycles"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              OKR Cycles
            </NavLink>

            <NavLink
              to="/objectives"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Objectives
            </NavLink>

            <NavLink
              to="/key-results"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Key Results
            </NavLink>

            <NavLink
              to="/check-ins/pending"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Check-ins
            </NavLink>
          </>
        )}

        {isGoalOwner && (
          <>
            <NavLink
              to="/objectives"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Objectives
            </NavLink>

            <NavLink
              to="/key-results"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Key Results
            </NavLink>

            <NavLink
              to="/check-ins/mine"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              My Check-ins
            </NavLink>
          </>
        )}

        {isTeamLead && (
          <NavLink
            to="/check-ins/pending"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Check-ins
          </NavLink>
        )}
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <span className="navbar-avatar">
            {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
          </span>

          <span className="navbar-welcome">
            {user?.fullName || "User"}
          </span>
        </div>

        <button
          type="button"
          className="btn-logout"
          id="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;