import React from "react";
import { useSelector } from "react-redux";

const StatCards = () => {
  const cycles = useSelector(
    (state) => state.okrCycles?.items || []
  );

  const objectives = useSelector(
    (state) => state.objectives?.items || []
  );

  const pendingCheckins = useSelector(
    (state) => state.checkins?.pendingItems || []
  );

  const activeCyclesCount = cycles.filter(
    (cycle) => cycle.status === "ACTIVE"
  ).length;

  const totalObjectivesCount = objectives.length;

  const pendingReviewsCount = pendingCheckins.length;

  return (
    <div className="stat-cards">
      <div className="stat-card">
        <span className="stat-card-label">
          Active Cycles
        </span>

        <strong className="stat-card-value">
          {activeCyclesCount}
        </strong>
      </div>

      <div className="stat-card">
        <span className="stat-card-label">
          Total Objectives
        </span>

        <strong className="stat-card-value">
          {totalObjectivesCount}
        </strong>
      </div>

      <div className="stat-card">
        <span className="stat-card-label">
          Pending Reviews
        </span>

        <strong className="stat-card-value">
          {pendingReviewsCount}
        </strong>
      </div>
    </div>
  );
};

export default StatCards;