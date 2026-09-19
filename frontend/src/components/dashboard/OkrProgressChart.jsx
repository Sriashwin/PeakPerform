import React from "react";
import { useSelector } from "react-redux";

const OkrProgressChart = () => {
  const objectives = useSelector(
    (state) => state.objectives?.items || []
  );

  const statusGroups = objectives.reduce((groups, objective) => {
    const status = objective.status || "UNKNOWN";

    groups[status] = (groups[status] || 0) + 1;

    return groups;
  }, {});

  const progressValues = objectives
    .map((objective) => Number(objective.progressPercent))
    .filter((value) => !Number.isNaN(value));

  const averageProgress =
    progressValues.length > 0
      ? progressValues.reduce((sum, value) => sum + value, 0) /
        progressValues.length
      : 0;

  return (
    <div className="okr-progress-chart">
      <h2>OKR Progress</h2>

      <div className="objective-status-distribution">
        <h3>Objectives by Status</h3>

        {Object.entries(statusGroups).map(([status, count]) => (
          <div
            className="status-distribution"
            key={status}
          >
            <span>{status}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>

      <div className="cycle-average-progress">
        <h3>Cycle Average Progress</h3>

        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={averageProgress}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(
                100,
                Math.max(0, averageProgress)
              )}%`,
            }}
          />
        </div>

        <span>
          {averageProgress.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

export default OkrProgressChart;