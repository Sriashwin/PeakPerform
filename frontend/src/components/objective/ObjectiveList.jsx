import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Objective.css";

import {
  fetchObjectives,
  createObjective,
  activateObjective,
  pauseObjective,
  resumeObjective,
} from "../../store/slices/objectiveSlice";

import {
  fetchTeamLeads,
  fetchGoalOwners,
} from "../../store/slices/authSlice";

import { fetchCycles } from "../../store/slices/okrCycleSlice";

const ObjectiveList = () => {
  const dispatch = useDispatch();

  // =========================
  // AUTH STATE
  // =========================
  const {
    user,
    teamLeads = [],
    goalOwners = [],
  } = useSelector((state) => state.auth || {});

  // =========================
  // OBJECTIVE STATE
  // =========================
  const {
    items = [],
    pagination = {},
    loading,
    error,
  } = useSelector((state) => state.objectives || {});

  const {
    totalPages = 1,
    totalElements = 0,
  } = pagination;

  // =========================
  // OKR CYCLE STATE
  // =========================
  const {
    items: cycles = [],
    loading: cyclesLoading,
  } = useSelector((state) => state.okrCycles || {});

  // =========================
  // LOCAL STATE
  // =========================
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [cycleId, setCycleId] = useState("");
  const [teamLeadId, setTeamLeadId] = useState("");
  const [goalOwnerId, setGoalOwnerId] = useState("");

  const [titleError, setTitleError] = useState("");

  // =========================
  // ROLES
  // =========================
  const roles = user?.roles || [];

  const isAdmin = roles.includes(
    "ROLE_PERFORMANCE_ADMIN"
  );

  const isGoalOwner = roles.includes(
    "ROLE_GOAL_OWNER"
  );

  const canManageObjectives =
    isAdmin || isGoalOwner;

  const canCreateObjective =
    isAdmin || isGoalOwner;

  // =========================
  // FETCH CYCLES
  // =========================
  useEffect(() => {
    dispatch(fetchCycles());
  }, [dispatch]);

  // =========================
  // FETCH ASSIGNMENT USERS
  // =========================
  useEffect(() => {
    dispatch(fetchTeamLeads());

    if (isAdmin) {
      dispatch(fetchGoalOwners());
    }
  }, [dispatch, isAdmin]);

  // =========================
  // OBJECTIVE REQUEST
  // =========================
  const buildObjectiveRequest = useCallback(() => {
    const request = {
      page: page - 1,
      size: 10,
    };

    /*
    * Admins can see all objectives.
    *
    * Goal owners see objectives owned by them.
    * Team leads can see objectives assigned to them.
    */
    if (isGoalOwner && user?.id) {
      request.ownerId = user.id;
    }

    return request;
  }, [page, isGoalOwner, user?.id]);

  // =========================
  // FETCH OBJECTIVES
  // =========================
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    dispatch(
      fetchObjectives(buildObjectiveRequest())
    );
  }, [
    dispatch,
    user?.id,
    buildObjectiveRequest,
  ]);

  // =========================
  // REFRESH OBJECTIVES
  // =========================
  const refreshObjectives = () => {
    dispatch(
      fetchObjectives(buildObjectiveRequest())
    );
  };

  // =========================
  // CREATE OBJECTIVE
  // =========================
  const handleCreateObjective = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError("Objective title is required");
      return;
    }

    if (!cycleId) {
      setTitleError("Please select an OKR cycle");
      return;
    }

    setTitleError("");

    const objectiveData = {
      title: title.trim(),
      cycleId: Number(cycleId),
    };

    /*
     * Team lead is optional.
     */
    if (teamLeadId) {
      objectiveData.teamLeadId =
        Number(teamLeadId);
    }

    /*
     * Only admins can assign an objective
     * to another goal owner.
     */
    if (isAdmin && goalOwnerId) {
      objectiveData.ownerId =
        Number(goalOwnerId);
    }

    const result = await dispatch(
      createObjective(objectiveData)
    );

    if (!createObjective.rejected.match(result)) {
      setTitle("");
      setCycleId("");
      setTeamLeadId("");
      setGoalOwnerId("");
      setTitleError("");
      setShowForm(false);

      refreshObjectives();
    }
  };

  // =========================
  // ACTIVATE OBJECTIVE
  // =========================
  const handleActivate = async (id) => {
    const result = await dispatch(
      activateObjective(id)
    );

    if (!activateObjective.rejected.match(result)) {
      refreshObjectives();
    }
  };

  // =========================
  // PAUSE OBJECTIVE
  // =========================
  const handlePause = async (id) => {
    const result = await dispatch(
      pauseObjective(id)
    );

    if (!pauseObjective.rejected.match(result)) {
      refreshObjectives();
    }
  };

  // =========================
  // RESUME OBJECTIVE
  // =========================
  const handleResume = async (id) => {
    const result = await dispatch(
      resumeObjective(id)
    );

    if (!resumeObjective.rejected.match(result)) {
      refreshObjectives();
    }
  };

  // =========================
  // PAGINATION
  // =========================
  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= totalPages
    ) {
      setPage(newPage);
    }
  };

  // =========================
  // SEARCH
  // =========================
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // =========================
  // STATUS FILTER
  // =========================
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  // =========================
  // FILTER OBJECTIVES
  // =========================
  const filteredItems = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return items.filter((objective) => {
      const title =
        objective.title?.toLowerCase() || "";

      const objectiveStatus =
        objective.status || "";

      const matchesSearch =
        !normalizedSearch ||
        title.includes(normalizedSearch);

      const matchesStatus =
        !status ||
        objectiveStatus === status;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [items, search, status]);

  // =========================
  // RESET FORM
  // =========================
  const handleCloseForm = () => {
    setShowForm(false);
    setTitle("");
    setCycleId("");
    setTeamLeadId("");
    setGoalOwnerId("");
    setTitleError("");
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="page-container">
      <main className="main-content">

        {/* =========================
            PAGE HEADER
        ========================== */}
        <div className="page-header">
          <div>
            <h1>Objectives</h1>

            {totalElements > 0 && (
              <p>
                {totalElements} objective
                {totalElements !== 1
                  ? "s"
                  : ""}
              </p>
            )}
          </div>

          {canCreateObjective && (
            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                setShowForm((prev) => !prev)
              }
            >
              {showForm
                ? "Cancel"
                : "+ Add Objective"}
            </button>
          )}
        </div>

        {/* =========================
            CREATE OBJECTIVE FORM
        ========================== */}
        {showForm &&
          canCreateObjective && (
            <form
              onSubmit={handleCreateObjective}
              className="objective-form"
            >
              {/* Title */}
              <div className="form-group">
                <label htmlFor="objective-title">
                  Title
                </label>

                <input
                  type="text"
                  id="objective-title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);

                    if (
                      e.target.value.trim()
                    ) {
                      setTitleError("");
                    }
                  }}
                  placeholder="Objective title"
                />

                {titleError && (
                  <span className="field-error">
                    {titleError}
                  </span>
                )}
              </div>

              {/* OKR Cycle */}
              <div className="form-group">
                <label htmlFor="okr-cycle">
                  OKR Cycle
                </label>

                <select
                  id="okr-cycle"
                  value={cycleId}
                  onChange={(e) =>
                    setCycleId(e.target.value)
                  }
                  disabled={cyclesLoading}
                >
                  <option value="">
                    {cyclesLoading
                      ? "Loading cycles..."
                      : "Select OKR Cycle"}
                  </option>

                  {cycles.map((cycle) => (
                    <option
                      key={cycle.id}
                      value={cycle.id}
                    >
                      {cycle.name ||
                        cycle.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Team Lead */}
              <div className="form-group">
                <label htmlFor="team-lead">
                  Team Lead
                </label>

                <select
                  id="team-lead"
                  value={teamLeadId}
                  onChange={(e) =>
                    setTeamLeadId(e.target.value)
                  }
                >
                  <option value="">
                    Select Team Lead
                  </option>

                  {teamLeads.map(
                    (teamLead) => (
                      <option
                        key={teamLead.id}
                        value={teamLead.id}
                      >
                        {teamLead.fullName}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Goal Owner - Admin Only */}
              {isAdmin && (
                <div className="form-group">
                  <label htmlFor="goal-owner">
                    Assign to Goal Owner
                  </label>

                  <select
                    id="goal-owner"
                    value={goalOwnerId}
                    onChange={(e) =>
                      setGoalOwnerId(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select Goal Owner
                    </option>

                    {goalOwners.map(
                      (goalOwner) => (
                        <option
                          key={goalOwner.id}
                          value={goalOwner.id}
                        >
                          {goalOwner.fullName}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Creating..."
                    : "Create Objective"}
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={
                    handleCloseForm
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

        {/* =========================
            FILTERS
        ========================== */}
        <div className="objective-filters">
          <input
            type="search"
            placeholder="Search objectives"
            value={search}
            onChange={
              handleSearchChange
            }
          />

          <select
            value={status}
            onChange={
              handleStatusChange
            }
          >
            <option value="">
              All Statuses
            </option>

            <option value="DRAFT">
              DRAFT
            </option>

            <option value="ACTIVE">
              ACTIVE
            </option>

            <option value="PAUSED">
              PAUSED
            </option>

            <option value="COMPLETED">
              COMPLETED
            </option>

            <option value="CANCELLED">
              CANCELLED
            </option>
          </select>
        </div>

        {/* =========================
            SEARCH/FILTER NOTICE
        ========================== */}
        {(search || status) && (
          <div className="filter-info">
            {search && (
              <span>
                Search:{" "}
                <strong>{search}</strong>
              </span>
            )}

            {status && (
              <span>
                Status:{" "}
                <strong>{status}</strong>
              </span>
            )}
          </div>
        )}

        {/* =========================
            ERROR
        ========================== */}
        {error && (
          <div className="alert-error">
            {typeof error === "string"
              ? error
              : error?.message ||
                "Failed to load objectives."}
          </div>
        )}

        {/* =========================
            LOADING
        ========================== */}
        {loading && (
          <p>Loading objectives...</p>
        )}

        {/* =========================
            OBJECTIVE TABLE
        ========================== */}
        {!loading &&
          filteredItems.length > 0 && (
            <div className="table-container">
              <table role="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>

                    {canManageObjectives && (
                      <th>Action</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map(
                    (objective) => (
                      <tr
                        key={objective.id}
                      >
                        <td>
                          {objective.title}
                        </td>

                        <td>
                          <span className="status-pill">
                            {objective.status ||
                              "—"}
                          </span>
                        </td>

                        {canManageObjectives && (
                          <td>
                            {/* DRAFT → ACTIVE */}
                            {objective.status ===
                              "DRAFT" && (
                              <button
                                type="button"
                                className="btn-primary"
                                onClick={() =>
                                  handleActivate(
                                    objective.id
                                  )
                                }
                                disabled={loading}
                              >
                                Activate
                              </button>
                            )}

                            {/* ACTIVE → PAUSED */}
                            {objective.status ===
                              "ACTIVE" && (
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() =>
                                  handlePause(
                                    objective.id
                                  )
                                }
                                disabled={loading}
                              >
                                Pause
                              </button>
                            )}

                            {/* PAUSED → ACTIVE */}
                            {objective.status ===
                              "PAUSED" && (
                              <button
                                type="button"
                                className="btn-primary"
                                onClick={() =>
                                  handleResume(
                                    objective.id
                                  )
                                }
                                disabled={loading}
                              >
                                Resume
                              </button>
                            )}

                            {/* COMPLETED / CANCELLED */}
                            {(objective.status ===
                              "COMPLETED" ||
                              objective.status ===
                                "CANCELLED") && (
                              <span>
                                —
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

        {/* =========================
            EMPTY STATE
        ========================== */}
        {!loading &&
          filteredItems.length === 0 &&
          !error && (
            <p>
              {items.length === 0
                ? "No objectives found."
                : "No objectives match the current filters."}
            </p>
          )}

        {/* =========================
            PAGINATION
        ========================== */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              type="button"
              disabled={page === 1}
              onClick={() =>
                handlePageChange(
                  page - 1
                )
              }
            >
              Previous
            </button>

            <span>
              Page {page} of{" "}
              {totalPages}
            </span>

            <button
              type="button"
              disabled={
                page === totalPages
              }
              onClick={() =>
                handlePageChange(
                  page + 1
                )
              }
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ObjectiveList;