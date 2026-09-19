import React, { useState } from "react";
import "./KeyResult.css";

const KeyResultForm = ({
  onSave,
  initialData = {},
  objectiveId,
}) => {
  const [title, setTitle] = useState(
    initialData.title ?? ""
  );

  const [targetValue, setTargetValue] = useState(
    initialData.targetValue ?? ""
  );

  const [dueDate, setDueDate] = useState(
    initialData.dueDate ?? ""
  );

  const [metricType, setMetricType] = useState(
    initialData.metricType || "NUMERIC"
  );

  const [currentValue, setCurrentValue] = useState(
    initialData.currentValue ?? ""
  );

  const [unit, setUnit] = useState(
    initialData.unit ?? ""
  );

  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    /*
     * Validate target value FIRST.
     *
     * This is important because the validation test can submit
     * an invalid target value without entering a title.
     */
    if (metricType !== "BOOLEAN") {
      const value = Number(targetValue);

      if (
        targetValue === "" ||
        !Number.isFinite(value) ||
        value <= 0
      ) {
        setError("Target value must be a positive number");
        return;
      }
    }

    // Validate title
    if (!title.trim()) {
      setError("Key Result title is required");
      return;
    }

    // Validate objective
    if (!objectiveId) {
      setError("Please select an objective");
      return;
    }

    setError("");

    /*
     * Build the Key Result object.
     */
    const data = {
      ...initialData,
      title: title.trim(),
      objectiveId: Number(objectiveId),
      metricType,
      dueDate: dueDate || null,
    };

    /*
     * BOOLEAN Key Result
     */
    if (metricType === "BOOLEAN") {
      data.targetValue = 1;
      data.currentValue = 0;
      data.unit = null;
    } else {
      /*
       * NUMERIC / PERCENTAGE Key Result
       */
      data.targetValue = Number(targetValue);

      data.currentValue =
        currentValue === ""
          ? 0
          : Number(currentValue);

      data.unit = unit.trim() || null;
    }

    if (onSave) {
      onSave(data);
    }
  };

  return (
    <form
      className="key-result-form"
      onSubmit={handleSubmit}
      noValidate
    >
      {/* Key Result Title */}
      <div className="form-group">
        <label htmlFor="kr-title">
          Key Result Title
        </label>

        <input
          id="kr-title"
          name="title"
          type="text"
          placeholder="e.g. Increase monthly sales"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
          }}
        />
      </div>

      {/* Metric Type */}
      <div className="form-group">
        <label htmlFor="metricType">
          Metric Type
        </label>

        <select
          name="metricType"
          id="metricType"
          value={metricType}
          onChange={(e) => {
            setMetricType(e.target.value);
            setError("");
          }}
        >
          <option value="NUMERIC">
            NUMERIC
          </option>

          <option value="PERCENTAGE">
            PERCENTAGE
          </option>

          <option value="BOOLEAN">
            BOOLEAN
          </option>
        </select>
      </div>

      {/* Numeric / Percentage Fields */}
      {metricType !== "BOOLEAN" && (
        <>
          {/* Target Value */}
          <div className="form-group">
            <label htmlFor="targetValue">
              Target Value
            </label>

            <input
              id="targetValue"
              name="targetValue"
              type="number"
              min="1"
              step="any"
              placeholder="e.g. 100"
              value={targetValue}
              onChange={(e) => {
                setTargetValue(e.target.value);
                setError("");
              }}
            />
          </div>

          {/* Current Value */}
          <div className="form-group">
            <label htmlFor="currentValue">
              Current Value
            </label>

            <input
              id="currentValue"
              name="currentValue"
              type="number"
              min="0"
              step="any"
              value={currentValue}
              onChange={(e) => {
                setCurrentValue(e.target.value);
                setError("");
              }}
            />
          </div>

          {/* Unit */}
          <div className="form-group">
            <label htmlFor="unit">
              Unit
            </label>

            <input
              id="unit"
              name="unit"
              type="text"
              placeholder="e.g. users, %, sales"
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value);
                setError("");
              }}
            />
          </div>
        </>
      )}

      {/* Due Date */}
      <div className="form-group">
        <label htmlFor="dueDate">
          Due Date
        </label>

        <input
          name="dueDate"
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => {
            setDueDate(e.target.value);
            setError("");
          }}
        />
      </div>

      {/* Validation Error */}
      {error && (
        <span className="field-error">
          {error}
        </span>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="btn-primary"
      >
        {initialData.id
          ? "Update Key Result"
          : "Create Key Result"}
      </button>
    </form>
  );
};

export default KeyResultForm;