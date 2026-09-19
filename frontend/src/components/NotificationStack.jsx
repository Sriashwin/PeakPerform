import React, { useEffect, useState } from "react";

let notificationListener = null;

export const notify = (message, type) => {
  if (notificationListener) {
    notificationListener({
      id: Date.now() + Math.random(),
      message,
      type,
    });
  }
};

const NotificationStack = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    notificationListener = (notification) => {
      setNotifications((current) => [...current, notification]);

      setTimeout(() => {
        setNotifications((current) =>
          current.filter((item) => item.id !== notification.id)
        );
      }, 3000);
    };

    return () => {
      notificationListener = null;
    };
  }, []);

  return (
    <div className="notification-stack">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`toast toast-${notification.type || "info"}`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

export default NotificationStack;