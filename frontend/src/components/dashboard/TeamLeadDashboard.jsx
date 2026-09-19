import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  fetchCycles,
  fetchCycleStats,
} from "../../store/slices/okrCycleSlice";

import {
  fetchPendingCheckins,
} from "../../store/slices/checkInSlice";

const TeamLeadDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const {
    items: cycles,
    cycleStats,
    loading: cycleLoading,
  } = useSelector((state) => state.okrCycles);

  const {
    pendingItems,
    loading: checkinLoading,
  } = useSelector((state) => state.checkins);

  /*
   * Fetch cycles and pending check-ins
   * when the dashboard loads.
   */
  useEffect(() => {
    dispatch(fetchCycles());
    dispatch(fetchPendingCheckins());
  }, [dispatch]);

  /*
   * Fetch statistics only for the ACTIVE cycle.
   *
   * Do not fall back to cycles[0], because the first
   * cycle may be a DRAFT/future cycle such as "Next Q".
   */
  useEffect(() => {
    if (!cycles?.length) {
      return;
    }

    const activeCycle = cycles.find(
      (cycle) => cycle.status === "ACTIVE"
    );

    if (activeCycle?.id) {
      dispatch(fetchCycleStats(activeCycle.id));
    }
  }, [cycles, dispatch]);

  const stats = cycleStats || {};

  const pendingCount =
    pendingItems?.length ??
    stats.pendingCheckIns ??
    0;

  const progress = Number(
    stats.averageProgress || 0
  );

  /*
   * Show loading while cycle data/statistics are
   * being loaded and no stats have arrived yet.
   */
  const isLoading =
    cycleLoading && !cycleStats;

  return (
    <section className="team-lead-dashboard">

      {/* Header */}
      <div className="team-lead-header">
        <div>
          <h2>Team Overview</h2>

          <p>
            Monitor OKR progress and review pending
            check-ins across your team.
          </p>
        </div>

        <div className="team-lead-user">
          <span>{user?.department}</span>
          <strong>Team Lead</strong>
        </div>
      </div>

      {/* Statistics */}
      <div className="team-lead-stat-cards">

        <div className="team-lead-stat-card">
          <span className="team-lead-stat-label">
            Objectives
          </span>

          <strong>
            {isLoading
              ? "—"
              : stats.totalObjectives ?? 0}
          </strong>

          <small>
            Current cycle
          </small>
        </div>

        <div className="team-lead-stat-card">
          <span className="team-lead-stat-label">
            Average Progress
          </span>

          <strong>
            {isLoading
              ? "—"
              : `${progress}%`}
          </strong>

          <small>
            Across objectives
          </small>
        </div>

        <div
          className="team-lead-stat-card clickable"
          onClick={() =>
            navigate("/check-ins/pending")
          }
        >
          <span className="team-lead-stat-label">
            Pending Check-ins
          </span>

          <strong>
            {checkinLoading
              ? "—"
              : pendingCount}
          </strong>

          <small>
            Requires review
          </small>
        </div>

      </div>

      {/* Current Cycle */}
      <div className="team-lead-dashboard-card">

        <div className="team-lead-card-header">
          <div>
            <h3>Current Cycle</h3>

            <p>
              {stats.cycleTitle ||
                "No active cycle available"}
            </p>
          </div>
        </div>

        <div className="team-lead-cycle-stats">

          <div>
            <span>Completed</span>

            <strong className="completed">
              {isLoading
                ? "—"
                : stats.completedObjectives ?? 0}
            </strong>
          </div>

          <div>
            <span>Active</span>

            <strong className="active">
              {isLoading
                ? "—"
                : stats.activeObjectives ?? 0}
            </strong>
          </div>

          <div>
            <span>Cancelled</span>

            <strong className="cancelled">
              {isLoading
                ? "—"
                : stats.cancelledObjectives ?? 0}
            </strong>
          </div>

        </div>

        <div className="team-lead-progress-section">

          <div className="team-lead-progress-header">
            <span>
              Average Objective Progress
            </span>

            <strong>
              {isLoading
                ? "—"
                : `${progress}%`}
            </strong>
          </div>

          <div className="team-lead-progress-bar">
            <div
              className="team-lead-progress-fill"
              style={{
                width: `${Math.min(
                  Math.max(progress, 0),
                  100
                )}%`,
              }}
            />
          </div>

        </div>

      </div>

      {/* Key Result Health */}
      <div className="team-lead-dashboard-card">

        <div className="team-lead-card-header">
          <div>
            <h3>Key Result Health</h3>

            <p>
              Current status across key results.
            </p>
          </div>
        </div>

        <div className="team-lead-kr-grid">

          <div className="team-lead-kr-item on-track">
            <span className="team-lead-kr-icon">
              ✓
            </span>

            <div>
              <strong>
                {isLoading
                  ? "—"
                  : stats.onTrackKeyResults ?? 0}
              </strong>

              <span>On Track</span>
            </div>
          </div>

          <div className="team-lead-kr-item at-risk">
            <span className="team-lead-kr-icon">
              !
            </span>

            <div>
              <strong>
                {isLoading
                  ? "—"
                  : stats.atRiskKeyResults ?? 0}
              </strong>

              <span>At Risk</span>
            </div>
          </div>

          <div className="team-lead-kr-item behind">
            <span className="team-lead-kr-icon">
              ↓
            </span>

            <div>
              <strong>
                {isLoading
                  ? "—"
                  : stats.behindKeyResults ?? 0}
              </strong>

              <span>Behind</span>
            </div>
          </div>

        </div>

      </div>

      {/* Pending Reviews */}
      <div className="team-lead-dashboard-card">

        <div className="team-lead-card-header">
          <div>
            <h3>Pending Reviews</h3>

            <p>
              Check-ins waiting for your review.
            </p>
          </div>

          <button
            type="button"
            className="team-lead-view-all"
            onClick={() =>
              navigate("/check-ins/pending")
            }
          >
            View All
          </button>
        </div>

        {pendingItems?.length > 0 ? (
          <div className="team-lead-pending-list">

            {pendingItems
              .slice(0, 5)
              .map((item, index) => (
                <div
                  className="team-lead-pending-item"
                  key={item.id || index}
                >
                  <div className="team-lead-pending-main">

                    <strong>
                      {item.goalOwnerName ||
                        item.ownerName ||
                        "Goal Owner"}
                    </strong>

                    <span>
                      {item.objectiveTitle ||
                        item.objectiveName ||
                        "Objective"}
                    </span>

                  </div>

                  <span className="team-lead-pending-status">
                    Pending
                  </span>
                </div>
              ))}

          </div>
        ) : (
          <div className="team-lead-empty-state">

            <span>✓</span>

            <p>
              No pending check-ins require your review.
            </p>

          </div>
        )}

      </div>

    </section>
  );
};

export default TeamLeadDashboard;