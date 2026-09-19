import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./CheckIn.css";

import {
  fetchMyCheckins,
  submitCheckin,
} from "../../store/slices/checkInSlice";

import { fetchObjectives } from "../../store/slices/objectiveSlice";

import { notify } from "../NotificationStack";
import CheckinForm from "./CheckInform";

const REVIEW_COLORS = {
  PENDING: "#d97706",
  APPROVED: "#16a34a",
  REJECTED: "#dc2626",
};

const MyCheckins = () => {
  const dispatch = useDispatch();

  const { user } = useSelector(
    (state) => state.auth || {}
  );

  const {
    items = [],
    pagination,
    loading,
    error,
  } = useSelector(
    (state) => state.checkins || {}
  );

  const pageIndex =
    pagination?.number ?? 0;

  const page = pageIndex + 1;

  const totalPages =
    pagination?.totalPages ?? 1;

  const [showForm, setShowForm] =
    useState(false);

  // =========================
  // FETCH CHECK-INS
  // + OBJECTIVES
  // =========================
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    // My check-ins
    dispatch(fetchMyCheckins(pageIndex));

    // My objectives
    dispatch(
      fetchObjectives({
        page: 0,
        size: 100,
        ownerId: user.id,
      })
    );
  }, [
    dispatch,
    pageIndex,
    user?.id,
  ]);

  // =========================
  // SUBMIT CHECK-IN
  // =========================
  const handleSubmitCheckin = async (
    data
  ) => {
    const result = await dispatch(
      submitCheckin(data)
    );

    if (
      !submitCheckin.rejected.match(result)
    ) {
      notify(
        "Check-in submitted for review",
        "success"
      );

      setShowForm(false);

      dispatch(
        fetchMyCheckins(pageIndex)
      );
    }
  };

  return (
    <div className="page-container">
      <main className="main-content">

        {/* =========================
            PAGE HEADER
        ========================== */}
        <div className="page-header">
          <h1>My Check-ins</h1>

          <button
            type="button"
            id="submit-checkin-btn"
            className="btn-primary"
            onClick={() =>
              setShowForm(true)
            }
          >
            + Submit Check-in
          </button>
        </div>

        {/* =========================
            ERROR
        ========================== */}
        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        {/* =========================
            CHECK-IN TABLE
        ========================== */}
        {loading ? (
          <p>Loading check-ins...</p>
        ) : (
          <table role="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Key Result</th>
                <th>Reported Value</th>
                <th>Confidence</th>
                <th>Submitted</th>
                <th>Review Status</th>
                <th>Notes</th>
              </tr>
            </thead>

            <tbody>
              {items.map(
                (checkin, index) => {
                  const status =
                    checkin.reviewStatus;

                  return (
                    <tr
                      key={checkin.id}
                    >
                      <td>
                        {pageIndex * 10 +
                          index +
                          1}
                      </td>

                      <td>
                        {
                          checkin.keyResultTitle
                        }
                      </td>

                      <td>
                        {
                          checkin.reportedValue
                        }
                      </td>

                      <td>
                        {
                          checkin.confidenceLevel
                        }
                        /10
                      </td>

                      <td>
                        {
                          checkin.submittedAt ||
                          "-"
                        }
                      </td>

                      <td>
                        <span
                          className="status-pill"
                          style={{
                            backgroundColor:
                              REVIEW_COLORS[
                                status
                              ],
                          }}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        {checkin.notes ||
                          "-"}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        )}

        {/* =========================
            PAGINATION
        ========================== */}
        {totalPages > 1 && (
          <div className="pagination">

            <button
              type="button"
              disabled={
                pageIndex <= 0
              }
              onClick={() =>
                dispatch(
                  fetchMyCheckins(
                    pageIndex - 1
                  )
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
                pageIndex >=
                totalPages - 1
              }
              onClick={() =>
                dispatch(
                  fetchMyCheckins(
                    pageIndex + 1
                  )
                )
              }
            >
              Next
            </button>

          </div>
        )}
      </main>

      {/* =========================
          SUBMIT CHECK-IN MODAL
      ========================== */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">

            <div className="modal-header">
              <h2>
                Submit Check-in
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
              >
                ×
              </button>
            </div>

            <CheckinForm
              onSave={
                handleSubmitCheckin
              }
              saving={loading}
            />

          </div>
        </div>
      )}
    </div>
  );
};

export default MyCheckins;