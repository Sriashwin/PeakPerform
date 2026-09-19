import React from "react";

const CapacityBar = ({ current, target, unit = "" }) => {
  const currentValue = Number(current) || 0;
  const targetValue = Number(target) || 0;

  const percentage =
    targetValue > 0
      ? Math.min(100, Math.max(0, (currentValue / targetValue) * 100))
      : 100;

  return (
    <div className="capacity-bar">
      <div className="capacity-label">
        {currentValue}/{targetValue}
        {unit}
      </div>

      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};

export default CapacityBar;