import React from "react";

const EmptyState = ({
  icon,
  title,
  message,
  ctaLabel,
  onCta,
}) => {
  return (
    <div className="empty-state">
      {icon && (
        <div className="empty-state-icon">
          {icon}
        </div>
      )}

      <h3>{title}</h3>

      {message && <p>{message}</p>}

      {ctaLabel && onCta && (
        <button
          type="button"
          className="btn-primary"
          onClick={onCta}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;