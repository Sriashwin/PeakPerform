import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";

import "./KeyResult.css";

import KeyResultForm from "./KeyResultForm";

import {
  fetchKeyResults,
  createKeyResult,
  updateKeyResult,
  deleteKeyResult,
} from "../../store/slices/keyResultSlice";

import { fetchObjectives } from "../../store/slices/objectiveSlice";

import SearchFilterBar from "../common/SearchFilterBar";
import CapacityBar from "../common/CapacityBar";

const STATUS_COLORS = {
  ON_TRACK: "#16a34a",
  AT_RISK: "#d97706",
  BEHIND: "#dc2626",
  COMPLETED: "#7c3aed",
};

const KeyResultList = () => {
  const dispatch = useDispatch();

  const { user } = useSelector(
    (state) => state.auth
  );

  const { items: objectives = [] } =
    useSelector(
      (state) => state.objectives || {}
    );

  const {
    items: keyResults = [],
    loading,
    error,
  } = useSelector(
    (state) => state.keyResults || {}
  );

  const [selectedObjective, setSelectedObjective] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingKeyResult, setEditingKeyResult] =
    useState(null);

  const [search, setSearch] = useState("");

  const [status, setStatus] =
    useState("");

  const roles = user?.roles || [];

  const isAdmin = roles.includes(
    "ROLE_PERFORMANCE_ADMIN"
  );

  const isGoalOwner = roles.includes(
    "ROLE_GOAL_OWNER"
  );

  const canEdit =
    roles.includes("ROLE_GOAL_OWNER") ||
    roles.includes("ROLE_PERFORMANCE_ADMIN");

  /*
   * Fetch objectives
   */
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const request = {
      page: 0,
      size: 100,
    };

    // Admin can see all objectives
    if (isAdmin) {
      // No ownerId filter
    }

    // Goal Owner sees their own objectives
    else if (isGoalOwner) {
      request.ownerId = user.id;
    }

    dispatch(fetchObjectives(request));
  }, [
    dispatch,
    user?.id,
    isAdmin,
    isGoalOwner,
  ]);

  /*
   * Fetch key results whenever
   * objective/search/status changes
   */
  useEffect(() => {
    if (selectedObjective) {
      dispatch(
        fetchKeyResults({
          objectiveId: selectedObjective,
          search,
          status,
        })
      );
    }
  }, [
    dispatch,
    selectedObjective,
    search,
    status,
  ]);

  /*
   * Filter key results
   */
  const filteredKeyResults = useMemo(() => {
    return keyResults.filter((keyResult) => {
      const matchesObjective =
        !selectedObjective ||
        String(keyResult.objectiveId) ===
          String(selectedObjective);

      const matchesSearch =
        !search ||
        keyResult.title
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        !status ||
        keyResult.status === status;

      return (
        matchesObjective &&
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    keyResults,
    selectedObjective,
    search,
    status,
  ]);

  /*
   * Delete key result
   */
  const handleDelete = async (id) => {
    const result = await dispatch(
      deleteKeyResult(id)
    );

    if (
      !deleteKeyResult.rejected.match(result)
    ) {
      dispatch(
        fetchKeyResults({
          objectiveId: selectedObjective,
          search,
          status,
        })
      );
    }
  };

  /*
   * Start editing a key result
   */
  const handleEdit = (keyResult) => {
    setEditingKeyResult(keyResult);
    setShowForm(true);
  };

  /*
   * Cancel create/edit form
   */
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingKeyResult(null);
  };

  return (
    <div className="page-container">
      <main className="main-content">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="page-header">
          <h1>Key Results</h1>

          {canEdit && selectedObjective && (
            <button
              type="button"
              id="add-kr-btn"
              className="btn-primary"
              onClick={() => {
                setEditingKeyResult(null);
                setShowForm(true);
              }}
            >
              + Add Key Result
            </button>
          )}
        </div>

        {/* =========================
            OBJECTIVE SELECT
        ========================= */}

        <div className="form-group">
          <label htmlFor="objective-select">
            Objective
          </label>

          <select
            id="objective-select"
            value={selectedObjective}
            onChange={(e) => {
              setSelectedObjective(
                e.target.value
              );

              setShowForm(false);
              setEditingKeyResult(null);
            }}
          >
            <option value="">
              Select Objective
            </option>

            {objectives.map((objective) => (
              <option
                key={objective.id}
                value={objective.id}
              >
                {objective.title}
              </option>
            ))}
          </select>
        </div>

        {/* =========================
            CREATE / EDIT FORM
        ========================= */}

        {showForm && selectedObjective && (
          <div className="key-result-form-container">

            <KeyResultForm
              objectiveId={selectedObjective}
              initialData={
                editingKeyResult || {}
              }
              onSave={async (data) => {
                let result;

                /*
                 * EDIT
                 */
                if (editingKeyResult) {
                  result = await dispatch(
                    updateKeyResult({
                      id: editingKeyResult.id,
                      data,
                    })
                  );
                }

                /*
                 * CREATE
                 */
                else {
                  result = await dispatch(
                    createKeyResult(data)
                  );
                }

                /*
                 * SUCCESS
                 */
                if (
                  createKeyResult.fulfilled.match(
                    result
                  ) ||
                  updateKeyResult.fulfilled.match(
                    result
                  )
                ) {
                  setShowForm(false);
                  setEditingKeyResult(null);

                  dispatch(
                    fetchKeyResults({
                      objectiveId:
                        selectedObjective,
                      search,
                      status,
                    })
                  );
                }
              }}
            />

            {/* Cancel button */}
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancelForm}
            >
              Cancel
            </button>

          </div>
        )}

        {/* =========================
            SEARCH / FILTER
        ========================= */}

        {selectedObjective && (
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            statusOptions={[
              "ON_TRACK",
              "AT_RISK",
              "BEHIND",
              "COMPLETED",
            ]}
          />
        )}

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        {/* =========================
            LOADING
        ========================= */}

        {loading && (
          <p>Loading key results...</p>
        )}

        {/* =========================
            KEY RESULT LIST
        ========================= */}

        {!loading && selectedObjective && (
          <div className="key-result-list">

            {filteredKeyResults.length === 0 ? (
              <p>No key results found.</p>
            ) : (
              filteredKeyResults.map(
                (keyResult) => {

                  const completed =
                    keyResult.status ===
                    "COMPLETED";

                  return (
                    <div
                      className="key-result-card"
                      key={keyResult.id}
                    >

                      {/* =========================
                          CARD HEADER
                      ========================= */}

                      <div className="key-result-header">

                        <h2>
                          {keyResult.title}
                        </h2>

                        <span
                          className="status-pill"
                          style={{
                            backgroundColor:
                              STATUS_COLORS[
                                keyResult.status
                              ],
                          }}
                        >
                          {keyResult.status}
                        </span>

                      </div>

                      {/* =========================
                          PROGRESS
                      ========================= */}

                      <CapacityBar
                        current={
                          keyResult.currentValue
                        }
                        target={
                          keyResult.targetValue
                        }
                      />

                      {/* =========================
                          ACTIONS
                      ========================= */}

                      {canEdit && !completed && (
                        <div className="key-result-actions">

                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() =>
                              handleEdit(
                                keyResult
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() =>
                              handleDelete(
                                keyResult.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>
                      )}

                    </div>
                  );
                }
              )
            )}

          </div>
        )}

      </main>
    </div>
  );
};

export default KeyResultList;