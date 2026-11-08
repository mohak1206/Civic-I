const KEYS = {
  ISSUES: 'civic_issues',
  CURRENT_USER: 'civic_current_user',
  USERS: 'civic_users',
  NOTIFICATIONS: 'civic_notifications',
};

/**
 * Safe localStorage setter with QuotaExceededError handling
 */
export function safeSetItem(key, value) {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return { success: true };
  } catch (error) {
    const isQuota =
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014;

    const message = isQuota
      ? 'Storage quota exceeded! Browser localStorage is full. Try uploading smaller photos or removing old reports.'
      : 'Failed to write to browser storage.';

    console.error('SafeLocalStorage Error:', error);
    return { success: false, error: message, isQuotaExceeded: isQuota };
  }
}

export function safeGetItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Failed to read key ${key} from storage:`, e);
    return defaultValue;
  }
}

/* ============================================================================
   Issues Operations
============================================================================ */
export function getIssues() {
  return safeGetItem(KEYS.ISSUES, []);
}

export function saveIssue(newIssue) {
  const issues = getIssues();
  const issueWithDefaults = {
    id: newIssue.id || `issue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: newIssue.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: newIssue.status || 'reported',
    ...newIssue,
  };

  const updated = [issueWithDefaults, ...issues];
  const result = safeSetItem(KEYS.ISSUES, updated);
  if (!result.success) {
    throw new Error(result.error);
  }

  window.dispatchEvent(new CustomEvent('civic-issues-updated', { detail: updated }));
  return issueWithDefaults;
}

export function updateIssue(id, updates) {
  const issues = getIssues();
  let updatedIssue = null;

  const nextIssues = issues.map((iss) => {
    if (iss.id === id) {
      updatedIssue = {
        ...iss,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return updatedIssue;
    }
    return iss;
  });

  if (!updatedIssue) {
    throw new Error(`Issue with id "${id}" was not found.`);
  }

  const result = safeSetItem(KEYS.ISSUES, nextIssues);
  if (!result.success) {
    throw new Error(result.error);
  }

  window.dispatchEvent(new CustomEvent('civic-issues-updated', { detail: nextIssues }));
  return updatedIssue;
}

export function deleteIssue(id) {
  const issues = getIssues();
  const nextIssues = issues.filter((iss) => iss.id !== id);
  const result = safeSetItem(KEYS.ISSUES, nextIssues);
  if (!result.success) {
    throw new Error(result.error);
  }
  window.dispatchEvent(new CustomEvent('civic-issues-updated', { detail: nextIssues }));
  return true;
}

/* ============================================================================
   User & Session Operations
============================================================================ */
export function getCurrentUser() {
  return safeGetItem(KEYS.CURRENT_USER, null);
}

export function saveCurrentUser(user) {
  const result = safeSetItem(KEYS.CURRENT_USER, user);
  if (result.success && user) {
    syncLeaderboardUser(user);
  }
  window.dispatchEvent(new CustomEvent('civic-auth-changed', { detail: user }));
  return user;
}

export function clearCurrentUser() {
  localStorage.removeItem(KEYS.CURRENT_USER);
  window.dispatchEvent(new CustomEvent('civic-auth-changed', { detail: null }));
}

/* ============================================================================
   Leaderboard Operations (Strictly Authenticated Browser Users - Never Invented)
============================================================================ */
export function getLeaderboardUsers() {
  const users = safeGetItem(KEYS.USERS, []);
  // Sort descending by points
  return users.sort((a, b) => (b.points || 0) - (a.points || 0));
}

export function syncLeaderboardUser(user) {
  if (!user || !user.id || user.role === 'official') return;
  const users = safeGetItem(KEYS.USERS, []);
  const index = users.findIndex((u) => u.id === user.id);

  if (index >= 0) {
    users[index] = { ...users[index], ...user };
  } else {
    users.push(user);
  }

  safeSetItem(KEYS.USERS, users);
}

/* ============================================================================
   Notification Operations
============================================================================ */
export function getNotifications() {
  return safeGetItem(KEYS.NOTIFICATIONS, []);
}

export function addNotification(notification) {
  const list = getNotifications();
  const newNotif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    date: new Date().toISOString(),
    read: false,
    ...notification,
  };
  const updated = [newNotif, ...list];
  safeSetItem(KEYS.NOTIFICATIONS, updated);
  window.dispatchEvent(new CustomEvent('civic-notifications-updated', { detail: updated }));
  return newNotif;
}

export function markNotificationsRead() {
  const list = getNotifications();
  const updated = list.map((n) => ({ ...n, read: true }));
  safeSetItem(KEYS.NOTIFICATIONS, updated);
  window.dispatchEvent(new CustomEvent('civic-notifications-updated', { detail: updated }));
  return updated;
}

export function clearReadNotifications() {
  const list = getNotifications();
  const updated = list.filter((n) => !n.read);
  safeSetItem(KEYS.NOTIFICATIONS, updated);
  window.dispatchEvent(new CustomEvent('civic-notifications-updated', { detail: updated }));
  return updated;
}

export function clearAllNotifications() {
  safeSetItem(KEYS.NOTIFICATIONS, []);
  window.dispatchEvent(new CustomEvent('civic-notifications-updated', { detail: [] }));
  return [];
}

