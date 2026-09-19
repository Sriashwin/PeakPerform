import React, { useMemo } from "react";
import { useSelector } from "react-redux";

const RecentActivity = () => {
  const objectives = useSelector(
    (state) => state.objectives?.items || []
  );

  const checkins = useSelector(
    (state) => state.checkins?.items || []
  );

  const activities = useMemo(() => {
    const objectiveActivities = objectives.map((objective) => ({
      id: `objective-${objective.id}`,
      type: "OBJECTIVE",
      title: objective.title,
      status: objective.status,
      date:
        objective.updatedAt ||
        objective.createdAt ||
        null,
    }));

    const checkinActivities = checkins.map((checkin) => ({
      id: `checkin-${checkin.id}`,
      type: "CHECK-IN",
      title: checkin.keyResultTitle,
      status:
        checkin.reviewStatus ||
        checkin.status,
      date:
        checkin.updatedAt ||
        checkin.submittedAt ||
        checkin.createdAt ||
        null,
    }));

    return [
      ...objectiveActivities,
      ...checkinActivities,
    ]
      .sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;

        return (
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
        );
      })
      .slice(0, 10);
  }, [objectives, checkins]);

  return (
    <section className="recent-activity">
      <h2>Recent Activity</h2>

      {activities.length === 0 ? (
        <p>No recent activity.</p>
      ) : (
        <div className="activity-timeline">
          {activities.map((activity) => (
            <div
              className="activity-item"
              key={activity.id}
            >
              <div className="activity-content">
                <span className="activity-type">
                  {activity.type}
                </span>

                <p>{activity.title}</p>

                {activity.status && (
                  <span className="status-pill">
                    {activity.status}
                  </span>
                )}

                {activity.date && (
                  <time dateTime={activity.date}>
                    {new Date(
                      activity.date
                    ).toLocaleString()}
                  </time>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default RecentActivity;