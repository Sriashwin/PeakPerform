import React from "react";

const ErrorHandler = ({ error }) => {
  if (!error) {
    return null;
  }

  return (
    <div>
      <p data-testid="error-message">{error}</p>
    </div>
  );
};

export default ErrorHandler;