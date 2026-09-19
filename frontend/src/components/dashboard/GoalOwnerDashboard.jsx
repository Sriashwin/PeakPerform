import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { fetchObjectives } from "../../store/slices/objectiveSlice";
import { fetchCycles } from "../../store/slices/okrCycleSlice";
import { fetchMyCheckins } from "../../store/slices/checkInSlice";

const GoalOwnerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth || {});

  const {
    items: objectives = [],
    loading: objectivesLoading,
    error: objectivesError,
  } = useSelector((state) => state.objectives || {});

  const {
    items: cycles = [],
    loading: cyclesLoading,
  } = useSelector((state) => state.okrCycles || {});

  const {
    items: checkins = [],
    loading: checkinsLoading,
  } = useSelector((state) => state.checkins || {});

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    dispatch(
      fetchObjectives({
        ownerId: user.id,
        page: 0,
        size: 10,
      })
    );

    dispatch(fetchCycles());

    dispatch(fetchMyCheckins(0));
  }, [dispatch, user?.id]);

  const activeCycle = useMemo(() => {
    return (
      cycles.find(
        (cycle) => cycle.status === "ACTIVE"
      ) || cycles[0]
    );
  }, [cycles]);

  const objectiveStats = useMemo(() => {
    const total = objectives.length;

    const active = objectives.filter(
      (objective) =>
        objective.status === "ACTIVE"
    ).length;

    const completed = objectives.filter(
      (objective) =>
        objective.status === "COMPLETED"
    ).length;

    const progressValues = objectives
      .map((objective) =>
        Number(
          objective.progressPercent ?? 0
        )
      )
      .filter((value) => !Number.isNaN(value));

    const averageProgress =
      progressValues.length > 0
        ? progressValues.reduce(
            (sum, value) => sum + value,
            0
          ) / progressValues.length
        : 0;

    return {
      total,
      active,
      completed,
      averageProgress,
    };
  }, [objectives]);

  const progress = Math.min(
    Math.max(
      Number(objectiveStats.averageProgress || 0),
      0
    ),
    100
  );

  const isLoading =
    objectivesLoading ||
    cyclesLoading ||
    checkinsLoading;

  return (
    <section className="goal-owner-dashboard">

      {/* Header */}
      <div className="goal-owner-header">
        <div>
          <span className="goal-owner-eyebrow">
            MY PERFORMANCE
          </span>

          <h2>
            Welcome back, {user?.fullName}
          </h2>

          <p>
            Track your objectives, progress and
            check-ins from one place.
          </p>
        </div>

        <div className="goal-owner-profile">
          <div className="goal-owner-avatar">
            {user?.fullName
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>

          <div>
            <strong>{user?.fullName}</strong>
            <span>
              {user?.department || "Goal Owner"}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="goal-owner-stat-cards">

        <div className="goal-owner-stat-card">
          <span className="goal-owner-stat-label">
            My Objectives
          </span>

          <strong>
            {isLoading
              ? "—"
              : objectiveStats.total}
          </strong>

          <small>
            Assigned to you
          </small>
        </div>

        <div className="goal-owner-stat-card">
          <span className="goal-owner-stat-label">
            Average Progress
          </span>

          <strong>
            {isLoading
              ? "—"
              : `${Math.round(progress)}%`}
          </strong>

          <small>
            Across your objectives
          </small>
        </div>

        <div className="goal-owner-stat-card">
          <span className="goal-owner-stat-label">
            Active Objectives
          </span>

          <strong>
            {isLoading
              ? "—"
              : objectiveStats.active}
          </strong>

          <small>
            Currently in progress
          </small>
        </div>

        <div
          className="goal-owner-stat-card clickable"
          onClick={() =>
            navigate("/check-ins/mine")
          }
        >
          <span className="goal-owner-stat-label">
            My Check-ins
          </span>

          <strong>
            {isLoading
              ? "—"
              : checkins.length}
          </strong>

          <small>
            View your check-in history
          </small>
        </div>

      </div>

      {/* Current Cycle */}
      <div className="goal-owner-dashboard-card">

        <div className="goal-owner-card-header">
          <div>
            <h3>Current OKR Cycle</h3>

            <p>
              {activeCycle?.name ||
                activeCycle?.title ||
                "No active cycle"}
            </p>
          </div>

          <span className="goal-owner-cycle-badge">
            {activeCycle?.status ||
              "—"}
          </span>
        </div>

        <div className="goal-owner-cycle-content">

          <div className="goal-owner-cycle-progress">

            <div className="goal-owner-progress-header">
              <span>
                Overall Objective Progress
              </span>

              <strong>
                {Math.round(progress)}%
              </strong>
            </div>

            <div className="goal-owner-progress-bar">
              <div
                className="goal-owner-progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

          </div>

          <div className="goal-owner-cycle-summary">

            <div>
              <span>Objectives</span>
              <strong>
                {objectiveStats.total}
              </strong>
            </div>

            <div>
              <span>Active</span>
              <strong className="active">
                {objectiveStats.active}
              </strong>
            </div>

            <div>
              <span>Completed</span>
              <strong className="completed">
                {objectiveStats.completed}
              </strong>
            </div>

          </div>

        </div>
      </div>

      {/* My Objectives */}
      <div className="goal-owner-dashboard-card">

        <div className="goal-owner-card-header">

          <div>
            <h3>My Objectives</h3>

            <p>
              Your current goals and their progress.
            </p>
          </div>

          <button
            type="button"
            className="goal-owner-view-all"
            onClick={() =>
              navigate("/objectives")
            }
          >
            View All
          </button>

        </div>

        {objectivesError ? (
          <div className="goal-owner-error">
            Unable to load your objectives.
          </div>
        ) : objectives.length > 0 ? (

          <div className="goal-owner-objective-list">

            {objectives
              .slice(0, 5)
              .map((objective) => {

                const objectiveProgress = Math.min(
                  Math.max(
                    Number(
                      objective.progressPercent ?? 0
                    ),
                    0
                  ),
                  100
                );

                return (
                  <div
                    className="goal-owner-objective-item"
                    key={objective.id}
                  >

                    <div className="goal-owner-objective-main">

                      <div>
                        <strong>
                          {objective.title}
                        </strong>

                        <span>
                          {objective.status ||
                            "No status"}
                        </span>
                      </div>

                      <strong>
                        {Math.round(
                          objectiveProgress
                        )}%
                      </strong>

                    </div>

                    <div className="goal-owner-objective-progress">
                      <div
                        style={{
                          width: `${objectiveProgress}%`,
                        }}
                      />
                    </div>

                  </div>
                );
              })}

          </div>

        ) : (

          <div className="goal-owner-empty-state">

            <span>○</span>

            <div>
              <strong>
                No objectives yet
              </strong>

              <p>
                You don't have any objectives
                assigned to you.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/objectives")
              }
            >
              View Objectives
            </button>

          </div>

        )}

      </div>

      {/* Recent Check-ins */}
      <div className="goal-owner-dashboard-card">

        <div className="goal-owner-card-header">

          <div>
            <h3>Recent Check-ins</h3>

            <p>
              Your latest progress updates.
            </p>
          </div>

          <button
            type="button"
            className="goal-owner-view-all"
            onClick={() =>
              navigate("/check-ins/mine")
            }
          >
            View All
          </button>

        </div>

        {checkins.length > 0 ? (

          <div className="goal-owner-checkin-list">

            {checkins
              .slice(0, 5)
              .map((checkin, index) => (

                <div
                  className="goal-owner-checkin-item"
                  key={checkin.id || index}
                >

                  <div className="goal-owner-checkin-icon">
                    ✓
                  </div>

                  <div className="goal-owner-checkin-main">

                    <strong>
                      {checkin.objectiveTitle ||
                        checkin.objectiveName ||
                        checkin.keyResultTitle ||
                        "Check-in"}
                    </strong>

                    <span>
                      {checkin.createdAt ||
                        checkin.checkInDate ||
                        "Recent update"}
                    </span>

                  </div>

                  <span className="goal-owner-checkin-status">
                    {checkin.status ||
                      "Submitted"}
                  </span>

                </div>

              ))}

          </div>

        ) : (

          <div className="goal-owner-empty-state">

            <span>✓</span>

            <div>
              <strong>
                No check-ins yet
              </strong>

              <p>
                Your submitted check-ins will
                appear here.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/check-ins/mine")
              }
            >
              My Check-ins
            </button>

          </div>

        )}

      </div>

    </section>
  );
};

export default GoalOwnerDashboard;