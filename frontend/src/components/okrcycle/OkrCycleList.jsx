import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./OkrCycle.css"


import {
  fetchCycles,
  createCycle,
  activateCycle,
  closeCycle,
  deleteCycle,
} from "../../store/slices/okrCycleSlice";

import OkrCycleForm from "./OkrCycleForm";
import { notify } from "../NotificationStack";

const OkrCycleList = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const {
    items = [],
    loading,
    error,
  } = useSelector((state) => state.okrCycles || {});

  const [showForm, setShowForm] = useState(false);

  const isAdmin = user?.roles?.includes(
    "ROLE_PERFORMANCE_ADMIN"
  );

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchCycles());
    }
  }, [dispatch, isAdmin]);

  const handleCreate = async (data) => {
    const result = await dispatch(createCycle(data));

    if (createCycle.fulfilled.match(result)) {
      notify("OKR cycle created successfully", "success");
      setShowForm(false);

      // Refresh from backend
      dispatch(fetchCycles());
    } else {
      notify(
        result.payload || "Failed to create OKR cycle",
        "error"
      );
    }
  };

  const handleActivate = async (id) => {
    const result = await dispatch(activateCycle(id));

    if (activateCycle.fulfilled.match(result)) {
      notify("OKR cycle activated", "success");
      dispatch(fetchCycles());
    } else {
      notify(
        result.payload || "Failed to activate OKR cycle",
        "error"
      );
    }
  };

  const handleClose = async (id) => {
    const result = await dispatch(closeCycle(id));

    if (closeCycle.fulfilled.match(result)) {
      notify("OKR cycle closed", "success");
      dispatch(fetchCycles());
    } else {
      notify(
        result.payload || "Failed to close OKR cycle",
        "error"
      );
    }
  };

  const handleDelete = async (id) => {
    const result = await dispatch(deleteCycle(id));

    if (deleteCycle.fulfilled.match(result)) {
      notify("OKR cycle deleted", "success");
      dispatch(fetchCycles());
    } else {
      notify(
        result.payload || "Failed to delete OKR cycle",
        "error"
      );
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="page-container">
      <main className="main-content">

        <div className="page-header">
          <div>
            <h1>OKR Cycles</h1>
            <p>Manage your organization's OKR cycles.</p>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            Create Cycle
          </button>
        </div>

        {error && (
          <div className="alert-error">
            {typeof error === "string"
              ? error
              : "Something went wrong"}
          </div>
        )}

        {loading ? (
          <p>Loading cycles...</p>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No OKR cycles yet</h3>
            <p>Create your first OKR cycle to get started.</p>
          </div>
        ) : (
          <div className="table-card">
            <table role="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Cycle Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((cycle) => (
                  <tr key={cycle.id}>
                    <td>
                      <strong>{cycle.title}</strong>
                    </td>

                    <td>{cycle.cycleType}</td>

                    <td>{cycle.startDate}</td>

                    <td>{cycle.endDate}</td>

                    <td>
                      <span className="status-pill">
                        {cycle.status}
                      </span>
                    </td>

                    <td>
                      <div className="action-group">

                        {cycle.status === "DRAFT" && (
                          <>
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={() =>
                                handleActivate(cycle.id)
                              }
                            >
                              Activate
                            </button>

                            {(!cycle.objectiveCount ||
                              cycle.objectiveCount === 0) && (
                              <button
                                type="button"
                                className="btn-danger"
                                onClick={() =>
                                  handleDelete(cycle.id)
                                }
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}

                        {cycle.status === "ACTIVE" && (
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() =>
                              handleClose(cycle.id)
                            }
                          >
                            Close
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">

              <div className="modal-header">
                <h2>Create Cycle</h2>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  ×
                </button>
              </div>

              <OkrCycleForm
                onSave={handleCreate}
              />

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default OkrCycleList;