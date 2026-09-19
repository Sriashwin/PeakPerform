import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import StatCards from "./StatCards";
import OkrProgressChart from "./OkrProgressChart";
import RecentActivity from "./RecentActivity";

import { fetchCycles } from "../../store/slices/okrCycleSlice";
import { fetchObjectives } from "../../store/slices/objectiveSlice";
import { fetchPendingCheckins } from "../../store/slices/checkInSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();

  const {
    loading: cycleLoading,
    error: cycleError,
  } = useSelector(
    (state) => state.okrCycles || {}
  );

  const {
    loading: objectiveLoading,
    error: objectiveError,
  } = useSelector(
    (state) => state.objectives || {}
  );

  const {
    loading: checkinLoading,
    error: checkinError,
  } = useSelector(
    (state) => state.checkins || {}
  );

  useEffect(() => {
    dispatch(fetchCycles());

    dispatch(
      fetchObjectives({
        page: 0,
        size: 100,
      })
    );

    dispatch(fetchPendingCheckins());
  }, [dispatch]);

  const isLoading =
    cycleLoading ||
    objectiveLoading ||
    checkinLoading;

  const error =
    cycleError ||
    objectiveError ||
    checkinError;

  return (
    <section className="dashboard-section">

      <div className="dashboard-header">
        <div>
          <h2>Performance Overview</h2>

          <p>
            You have full visibility across the
            PeakPerform platform.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="dashboard-loading">
          Loading performance data...
        </div>
      )}

      {error && (
        <div className="dashboard-error">
          {typeof error === "string"
            ? error
            : "Unable to load dashboard data."}
        </div>
      )}

      <StatCards />

      <OkrProgressChart />

      <RecentActivity />

    </section>
  );
};

export default AdminDashboard;