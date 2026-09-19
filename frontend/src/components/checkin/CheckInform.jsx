import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./CheckIn.css";

import { fetchObjectives } from "../../store/slices/objectiveSlice";
import { fetchKeyResults } from "../../store/slices/keyResultSlice";

const CheckinForm = ({ onSave, saving = false }) => {
  const dispatch = useDispatch();

  // =========================
  // AUTH STATE
  // =========================
  const { user } = useSelector(
    (state) => state.auth || {}
  );

  // =========================
  // OBJECTIVE STATE
  // =========================
  const {
    items: objectives = [],
    loading: objectivesLoading,
  } = useSelector(
    (state) => state.objectives || {}
  );

  // =========================
  // KEY RESULT STATE
  // =========================
  const {
    items: keyResults = [],
    loading: keyResultsLoading,
  } = useSelector(
    (state) => state.keyResults || {}
  );

  // =========================
  // LOCAL STATE
  // =========================
  const [objectiveId, setObjectiveId] = useState("");
  const [keyResultId, setKeyResultId] = useState("");
  const [reportedValue, setReportedValue] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState("");
  const [notes, setNotes] = useState("");

  // =========================
  // FETCH OBJECTIVES
  // =========================
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const request = {
      page: 0,
      size: 100,
    };

    /*
     * Goal Owners should only see
     * objectives belonging to them.
     *
     * Admins can see all objectives.
     */
    const roles = user?.roles || [];

    const isAdmin = roles.includes(
      "ROLE_PERFORMANCE_ADMIN"
    );

    if (!isAdmin) {
      request.ownerId = user.id;
    }

    dispatch(fetchObjectives(request));
  }, [dispatch, user?.id, user?.roles]);

  // =========================
  // FETCH KEY RESULTS
  // =========================
  useEffect(() => {
    if (!objectiveId) {
      return;
    }

    dispatch(
      fetchKeyResults({
        objectiveId: Number(objectiveId),
        page: 0,
        size: 100,
      })
    );
  }, [dispatch, objectiveId]);

  // =========================
  // ACTIVE OBJECTIVES
  // =========================
  const activeObjectives = objectives.filter(
    (objective) =>
      objective.status === "ACTIVE"
  );

  // =========================
  // AVAILABLE KEY RESULTS
  // =========================
  const availableKeyResults =
    keyResults.filter(
      (keyResult) =>
        String(keyResult.objectiveId) ===
          String(objectiveId) &&
        keyResult.status !== "COMPLETED"
    );

  // =========================
  // OBJECTIVE CHANGE
  // =========================
  const handleObjectiveChange = (e) => {
    setObjectiveId(e.target.value);

    // Reset selected KR
    setKeyResultId("");
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (onSave) {
      onSave({
        objectiveId,
        keyResultId,
        reportedValue,
        confidenceLevel,
        notes,
      });
    }
  };

  return (
    <form
      className="checkin-form"
      onSubmit={handleSubmit}
    >
      {/* =========================
          OBJECTIVE
      ========================== */}
      <div className="form-group">
        <label htmlFor="objective">
          Objective
        </label>

        <select
          id="objective"
          name="objective"
          value={objectiveId}
          onChange={handleObjectiveChange}
          disabled={objectivesLoading}
        >
          <option value="">
            {objectivesLoading
              ? "Loading objectives..."
              : "Select Objective"}
          </option>

          {activeObjectives.map(
            (objective) => (
              <option
                key={objective.id}
                value={objective.id}
              >
                {objective.title}
              </option>
            )
          )}
        </select>

        {!objectivesLoading &&
          activeObjectives.length === 0 && (
            <span className="field-error">
              No active objectives available.
            </span>
          )}
      </div>

      {/* =========================
          KEY RESULT
      ========================== */}
      <div className="form-group">
        <label htmlFor="keyResult">
          Key Result
        </label>

        <select
          id="keyResult"
          name="keyResult"
          value={keyResultId}
          onChange={(e) =>
            setKeyResultId(e.target.value)
          }
          disabled={
            !objectiveId ||
            keyResultsLoading
          }
        >
          <option value="">
            {keyResultsLoading
              ? "Loading key results..."
              : "Select Key Result"}
          </option>

          {availableKeyResults.map(
            (keyResult) => (
              <option
                key={keyResult.id}
                value={keyResult.id}
              >
                {keyResult.title}
              </option>
            )
          )}
        </select>
      </div>

      {/* =========================
          REPORTED VALUE
      ========================== */}
      <div className="form-group">
        <label htmlFor="reportedValue">
          Reported Value
        </label>

        <input
          id="reportedValue"
          name="reportedValue"
          type="number"
          min="0"
          value={reportedValue}
          onChange={(e) =>
            setReportedValue(e.target.value)
          }
        />
      </div>

      {/* =========================
          CONFIDENCE LEVEL
      ========================== */}
      <div className="form-group">
        <label htmlFor="confidenceLevel">
          Confidence Level
        </label>

        <input
          id="confidenceLevel"
          name="confidenceLevel"
          type="number"
          min="1"
          max="10"
          value={confidenceLevel}
          onChange={(e) =>
            setConfidenceLevel(e.target.value)
          }
        />
      </div>

      {/* =========================
          NOTES
      ========================== */}
      <div className="form-group">
        <label htmlFor="notes">
          Notes
        </label>

        <textarea
          id="notes"
          name="notes"
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
        />
      </div>

      {/* =========================
          SUBMIT
      ========================== */}
      <button
        type="submit"
        className="btn-primary"
        disabled={saving}
      >
        {saving
          ? "Submitting..."
          : "Submit Check-in"}
      </button>
    </form>
  );
};

export default CheckinForm;