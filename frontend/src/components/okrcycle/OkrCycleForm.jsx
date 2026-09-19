import React, { useState } from "react";
import "./OkrCycle.css"

const OkrCycleForm = ({
  onSave,
  initialData = {},
  isEdit = false,
}) => {
  const [title, setTitle] = useState(
    initialData.title || ""
  );

  const [cycleType, setCycleType] = useState(
    initialData.cycleType || "QUARTERLY"
  );

  const [startDate, setStartDate] = useState(
    initialData.startDate || ""
  );

  const [endDate, setEndDate] = useState(
    initialData.endDate || ""
  );

  const [titleError, setTitleError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError("Cycle title is required");
      return;
    }

    setTitleError("");

    if (onSave) {
      onSave({
        ...initialData,
        title: title.trim(),
        cycleType,
        startDate,
        endDate,
      });
    }
  };

  return (
    <form
      className="okr-cycle-form"
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label htmlFor="cycle-title">
          Cycle Title
        </label>

        <input
          type="text"
          id="cycle-title"
          name="title"
          placeholder="e.g. Q1 2024"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);

            if (e.target.value.trim()) {
              setTitleError("");
            }
          }}
        />

        {titleError && (
          <span className="field-error">
            {titleError}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="cycle-type">
          Cycle Type
        </label>

        <select
          id="cycle-type"
          name="cycleType"
          value={cycleType}
          onChange={(e) =>
            setCycleType(e.target.value)
          }
        >
          <option value="QUARTERLY">
            QUARTERLY
          </option>
          <option value="ANNUAL">
            ANNUAL
          </option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="start-date">
          Start Date
        </label>

        <input
          type="date"
          id="start-date"
          name="startDate"
          value={startDate}
          onChange={(e) =>
            setStartDate(e.target.value)
          }
        />
      </div>

      <div className="form-group">
        <label htmlFor="end-date">
          End Date
        </label>

        <input
          type="date"
          id="end-date"
          name="endDate"
          value={endDate}
          onChange={(e) =>
            setEndDate(e.target.value)
          }
        />
      </div>

      <button
        type="submit"
        className="btn-primary"
      >
        {isEdit
          ? "Update Cycle"
          : "Create Cycle"}
      </button>
    </form>
  );
};

export default OkrCycleForm;