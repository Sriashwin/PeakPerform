import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./CheckIn.css";

import {
  fetchPendingCheckins,
  approveCheckin,
  rejectCheckin,
} from "../../store/slices/checkInSlice";

import { notify } from "../NotificationStack";
import EmptyState from "../common/EmptyState";
import SearchFilterBar from "../common/SearchFilterBar";

const CheckinList = () => {
  const dispatch = useDispatch();

  const {
    pendingItems = [],
    loading,
    error,
  } = useSelector((state) => state.checkins || {});

  const [rejectionReasons, setRejectionReasons] =
    useState({});

  const [searchValue, setSearchValue] =
    useState("");

  const [filterValue, setFilterValue] =
    useState("");

  // =========================
  // FETCH PENDING CHECK-INS
  // =========================
  useEffect(() => {
    dispatch(fetchPendingCheckins());
  }, [dispatch]);

  // =========================
  // APPROVE
  // =========================
  const handleApprove = async (id) => {
    const result = await dispatch(
      approveCheckin(id)
    );

    if (!approveCheckin.rejected.match(result)) {
      notify(
        "Check-in approved and key result updated",
        "success"
      );

      dispatch(fetchPendingCheckins());
    }
  };

  // =========================
  // REJECT
  // =========================
  const handleReject = async (id) => {
    const reason =
      rejectionReasons[id]?.trim() || "";

    if (!reason) {
      notify(
        "Please enter a rejection reason",
        "error"
      );
      return;
    }

    const result = await dispatch(
      rejectCheckin({
        id,
        rejectionReason: reason,
      })
    );

    if (!rejectCheckin.rejected.match(result)) {
      notify(
        "Check-in rejected.",
        "success"
      );

      setRejectionReasons((current) => {
        const updated = { ...current };
        delete updated[id];
        return updated;
      });

      dispatch(fetchPendingCheckins());
    }
  };

  // =========================
  // SEARCH + FILTER
  // =========================
  const filteredCheckins = useMemo(() => {
    const search =
      searchValue.trim().toLowerCase();

    return pendingItems.filter((checkin) => {
      // Search key result or submitter
      const matchesSearch =
        !search ||
        checkin.keyResultTitle
          ?.toLowerCase()
          .includes(search) ||
        checkin.submittedByName
          ?.toLowerCase()
          .includes(search);

      // Confidence filter
      let matchesFilter = true;

      if (filterValue) {
        const confidence = Number(
          checkin.confidenceLevel
        );

        switch (filterValue) {
          case "LOW":
            matchesFilter =
              confidence >= 1 &&
              confidence <= 3;
            break;

          case "MEDIUM":
            matchesFilter =
              confidence >= 4 &&
              confidence <= 6;
            break;

          case "HIGH":
            matchesFilter =
              confidence >= 7 &&
              confidence <= 8;
            break;

          case "VERY_HIGH":
            matchesFilter =
              confidence >= 9 &&
              confidence <= 10;
            break;

          default:
            matchesFilter = true;
        }
      }

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    pendingItems,
    searchValue,
    filterValue,
  ]);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="page-container">
        <main className="main-content">
          <h1>Pending Check-ins</h1>
          <p>Loading check-ins...</p>
        </main>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <div className="page-container">
        <main className="main-content">
          <h1>Pending Check-ins</h1>

          <div className="alert-error">
            {error}
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="page-container">
      <main className="main-content">

        {/* =========================
            HEADER
        ========================== */}
        <div className="page-header">
          <h1>Pending Check-ins</h1>

          <span className="count-badge">
            {pendingItems.length}
          </span>
        </div>

        {/* =========================
            SEARCH + FILTER
        ========================== */}
        {pendingItems.length > 0 && (
          <SearchFilterBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            filterValue={filterValue}
            onFilterChange={setFilterValue}
            searchPlaceholder="Search key result or employee..."
            filterOptions={[
              {
                value: "LOW",
                label: "Low Confidence (1-3)",
              },
              {
                value: "MEDIUM",
                label: "Medium Confidence (4-6)",
              },
              {
                value: "HIGH",
                label: "High Confidence (7-8)",
              },
              {
                value: "VERY_HIGH",
                label: "Very High Confidence (9-10)",
              },
            ]}
          />
        )}

        {/* =========================
            EMPTY STATE
        ========================== */}
        {pendingItems.length === 0 ? (
          <EmptyState title="All Clear" />
        ) : filteredCheckins.length === 0 ? (
          <EmptyState title="No matching check-ins" />
        ) : (
          <div className="checkin-list">

            {filteredCheckins.map(
              (checkin) => (
                <div
                  className="checkin-card"
                  key={checkin.id}
                >
                  {/* Key Result */}
                  <h2>
                    {checkin.keyResultTitle}
                  </h2>

                  {/* Submitted By */}
                  <p>
                    <strong>
                      Submitted by:
                    </strong>{" "}
                    {checkin.submittedByName}
                  </p>

                  {/* Reported Value */}
                  <p>
                    <strong>
                      Reported Value:
                    </strong>{" "}
                    {checkin.reportedValue}
                  </p>

                  {/* Confidence */}
                  <p>
                    <strong>
                      Confidence:
                    </strong>{" "}
                    {checkin.confidenceLevel}/10
                  </p>

                  {/* Notes */}
                  {checkin.notes && (
                    <p>
                      <strong>
                        Notes:
                      </strong>{" "}
                      {checkin.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="checkin-actions">

                    <button
                      type="button"
                      className="btn-approve"
                      id={`approve-checkin-${checkin.id}`}
                      onClick={() =>
                        handleApprove(
                          checkin.id
                        )
                      }
                    >
                      Approve
                    </button>

                    <div className="reject-section">
                      <input
                        type="text"
                        placeholder="Rejection reason"
                        value={
                          rejectionReasons[
                            checkin.id
                          ] || ""
                        }
                        onChange={(e) =>
                          setRejectionReasons(
                            (current) => ({
                              ...current,
                              [checkin.id]:
                                e.target.value,
                            })
                          )
                        }
                      />

                      <button
                        type="button"
                        className="btn-reject"
                        onClick={() =>
                          handleReject(
                            checkin.id
                          )
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default CheckinList;