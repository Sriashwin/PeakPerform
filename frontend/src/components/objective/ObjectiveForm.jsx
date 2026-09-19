import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchTeamLeads,
  fetchGoalOwners,
} from "../../store/slices/authSlice";

import "./Objective.css";

const ObjectiveForm = ({
  onSave,
  initialData = {},
  isEdit = false,
}) => {
  const dispatch = useDispatch();

  // ========================================
  // AUTH USER
  // ========================================

  const { user } = useSelector(
    (state) => state.auth || {}
  );

  // ========================================
  // OKR CYCLES
  // ========================================

  const cycles = useSelector(
    (state) => state.okrCycles?.items || []
  );

  // ========================================
  // USERS FOR ASSIGNMENT
  // ========================================

  const teamLeads = useSelector(
    (state) => state.auth?.teamLeads || []
  );

  const goalOwners = useSelector(
    (state) => state.auth?.goalOwners || []
  );

  // ========================================
  // FORM STATE
  // ========================================

  const [title, setTitle] = useState(
    initialData.title || ""
  );

  const [cycleId, setCycleId] = useState(
    initialData.cycleId || ""
  );

  const [teamLeadId, setTeamLeadId] = useState(
    initialData.teamLeadId || ""
  );

  const [goalOwnerId, setGoalOwnerId] = useState(
    initialData.ownerId ?? initialData.goalOwnerId ?? ""
  );

  const [titleError, setTitleError] = useState("");

  // ========================================
  // ROLE
  // ========================================

  const isAdmin = user?.roles?.includes(
    "ROLE_PERFORMANCE_ADMIN"
  );

  // ========================================
  // FETCH ASSIGNMENT USERS
  // ========================================

  useEffect(() => {
    dispatch(fetchTeamLeads());

    if (isAdmin) {
      dispatch(fetchGoalOwners());
    }
  }, [dispatch, isAdmin]);

  // ========================================
  // AVAILABLE CYCLES
  // ========================================

  const availableCycles = cycles.filter(
    (cycle) =>
      cycle.status === "ACTIVE" ||
      cycle.status === "DRAFT"
  );

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError(
        "Objective title is required"
      );
      return;
    }

    setTitleError("");

    if (onSave) {
      onSave({
        ...initialData,

        title: title.trim(),

        cycleId,

        teamLeadId,

        ...(isAdmin && {
          ownerId: goalOwnerId,
        }),
      });
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <form
      className="objective-form"
      onSubmit={handleSubmit}
    >

      {/* ======================================
          TITLE
      ====================================== */}

      <div className="form-group">

        <label htmlFor="title">
          Title
        </label>

        <input
          type="text"
          name="title"
          id="title"
          placeholder="e.g. Improve customer retention by 20%"
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


      {/* ======================================
          OKR CYCLE
      ====================================== */}

      <div className="form-group">

        <label htmlFor="okr-cycle">
          OKR Cycle
        </label>

        <select
          id="okr-cycle"
          name="cycleId"
          value={cycleId}
          onChange={(e) =>
            setCycleId(e.target.value)
          }
        >

          <option value="">
            Select OKR Cycle
          </option>

          {availableCycles.map((cycle) => (
            <option
              key={cycle.id}
              value={cycle.id}
            >
              {cycle.title}
            </option>
          ))}

        </select>

      </div>


      {/* ======================================
          TEAM LEAD
      ====================================== */}

      <div className="form-group">

        <label htmlFor="team-lead">
          Team Lead
        </label>

        <select
          id="team-lead"
          name="teamLeadId"
          value={teamLeadId}
          onChange={(e) =>
            setTeamLeadId(e.target.value)
          }
        >

          <option value="">
            Select Team Lead
          </option>

          {teamLeads.map((teamLead) => (
            <option
              key={teamLead.id}
              value={teamLead.id}
            >
              {teamLead.fullName}
            </option>
          ))}

        </select>

      </div>


      {/* ======================================
          GOAL OWNER
      ====================================== */}

      {isAdmin && (
        <div className="form-group">

          <label htmlFor="goal-owner">
            Assign to Goal Owner
          </label>

          <select
            id="goal-owner"
            name="goalOwnerId"
            value={goalOwnerId}
            onChange={(e) =>
              setGoalOwnerId(e.target.value)
            }
          >

            <option value="">
              Select Goal Owner
            </option>

            {goalOwners.map((goalOwner) => (
              <option
                key={goalOwner.id}
                value={goalOwner.id}
              >
                {goalOwner.fullName}
              </option>
            ))}

          </select>

        </div>
      )}


      {/* ======================================
          SUBMIT
      ====================================== */}

      <button
        type="submit"
        className="btn-primary"
      >
        {isEdit
          ? "Update Objective"
          : "Create Objective"}
      </button>

    </form>
  );
};

export default ObjectiveForm;