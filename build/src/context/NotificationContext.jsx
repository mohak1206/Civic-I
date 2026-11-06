import React, { createContext, useContext, useState, useEffect } from 'react';
import { getNotifications, addNotification, markNotificationsRead } from '../services/storage';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => getNotifications());

  useEffect(() => {
    const handleUpdate = (e) => {
      setNotifications(e.detail || []);
    };
    window.addEventListener('civic-notifications-updated', handleUpdate);
    return () => window.removeEventListener('civic-notifications-updated', handleUpdate);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const notify = ({ title, message, type = 'info', link = null }) => {
    return addNotification({ title, message, type, link });
  };

  const markAllRead = () => {
    return markNotificationsRead();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        notify,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
}

