import React from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { useSelector } from "react-redux";

// Dashboards
import AdminDashboard from "./components/dashboard/AdminDashboard";
import GoalOwnerDashboard from "./components/dashboard/GoalOwnerDashboard";
import TeamLeadDashboard from "./components/dashboard/TeamLeadDashboard";

// Layout
import Navbar from "./components/layout/Navbar";

// Authentication
import Login from "./components/Login";

// Dashboard styles
import "./components/dashboard/Dashboard.css";

// OKR Cycle
import OkrCycleList from "./components/okrcycle/OkrCycleList";

// Objectives
import ObjectiveList from "./components/objective/ObjectiveList";

// Key Results
import KeyResultList from "./components/keyresult/KeyResultList";

// Check-ins
import CheckinList from "./components/checkin/CheckInList";
import MyCheckins from "./components/checkin/MyCheckIns";

/*
 * ---------------------------------------------------------
 * Private Route
 * ---------------------------------------------------------
 */
const PrivateRoute = ({ children }) => {
  const { user } = useSelector(
    (state) => state.auth
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/*
 * ---------------------------------------------------------
 * Admin Route
 * ---------------------------------------------------------
 */
const AdminRoute = ({ children }) => {
  const { user } = useSelector(
    (state) => state.auth
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.roles?.includes(
    "ROLE_PERFORMANCE_ADMIN"
  );

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/*
 * ---------------------------------------------------------
 * Authenticated Layout
 * ---------------------------------------------------------
 * Shared application shell for authenticated users.
 */
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="app-layout">

      {/* Navigation */}
      <Navbar />

      <main className="app-content">

        {/* Application Branding */}
        <div className="page-container">
          <div className="main-content">

            <div className="dashboard-header">
              <div>

                <div className="app-brand">

                  <div className="brand-icon">
                    <span>PP</span>
                  </div>

                  <div className="brand-content">
                    <h1 className="title-app">
                      PeakPerform
                    </h1>

                    <span className="brand-tagline">
                      Perform at your peak
                    </span>
                  </div>

                </div>

              </div>
            </div>

            {/* Page Content */}
            {children}

          </div>
        </div>

      </main>
    </div>
  );
};

/*
 * ---------------------------------------------------------
 * Home Page
 * ---------------------------------------------------------
 * Selects the dashboard based on the authenticated user's
 * role.
 */
const HomePage = () => {
  const { user } = useSelector(
    (state) => state.auth
  );

  const roles = user?.roles || [];

  const isAdmin = roles.includes(
    "ROLE_PERFORMANCE_ADMIN"
  );

  const isTeamLead = roles.includes(
    "ROLE_TEAM_LEAD"
  );

  const isGoalOwner = roles.includes(
    "ROLE_GOAL_OWNER"
  );

  return (
    <>
      {/* Performance Administrator */}
      {isAdmin && <AdminDashboard />}

      {/* Team Lead */}
      {isTeamLead && <TeamLeadDashboard />}

      {/* Goal Owner */}
      {isGoalOwner && <GoalOwnerDashboard />}
    </>
  );
};

/*
 * ---------------------------------------------------------
 * Application
 * ---------------------------------------------------------
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Home / Dashboard */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <HomePage />
              </AuthenticatedLayout>
            </PrivateRoute>
          }
        />

        {/* OKR Cycles - Admin Only */}
        <Route
          path="/cycles"
          element={
            <AdminRoute>
              <AuthenticatedLayout>
                <OkrCycleList />
              </AuthenticatedLayout>
            </AdminRoute>
          }
        />

        {/* Objectives */}
        <Route
          path="/objectives"
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <ObjectiveList />
              </AuthenticatedLayout>
            </PrivateRoute>
          }
        />

        {/* Key Results */}
        <Route
          path="/key-results"
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <KeyResultList />
              </AuthenticatedLayout>
            </PrivateRoute>
          }
        />

        {/* Pending Check-ins */}
        <Route
          path="/check-ins/pending"
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <CheckinList />
              </AuthenticatedLayout>
            </PrivateRoute>
          }
        />

        {/* My Check-ins */}
        <Route
          path="/check-ins/mine"
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <MyCheckins />
              </AuthenticatedLayout>
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;