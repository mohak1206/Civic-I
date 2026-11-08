import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, saveCurrentUser, clearCurrentUser, getIssues } from '../services/storage';
import { loginWithGoogle, logoutFirebase, createDemoUser, isFirebaseConfigured } from '../services/firebase';
import { getLevel } from '../services/gamification';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuthChange = (e) => {
      setUser(e.detail);
    };
    window.addEventListener('civic-auth-changed', handleAuthChange);
    return () => window.removeEventListener('civic-auth-changed', handleAuthChange);
  }, []);

  // Self-heal: ensure user points and badges reflect existing submitted reports
  useEffect(() => {
    const current = getCurrentUser();
    if (current && current.id) {
      try {
        const issues = getIssues();
        const userIssues = issues.filter(
          (i) => i.reporterId === current.id || (current.isDemo && (!i.reporterId || i.reporterId === 'usr_anonymous' || i.reporterId.includes('demo')))
        );
        const totalEarned = userIssues.reduce((sum, i) => sum + (Number(i.pointsAwarded) || 0), 0);
        const currentPoints = Math.max(current.points || 0, totalEarned);

        const badgeStats = {
          totalReports: userIssues.length,
          reportsWithLocation: userIssues.filter((i) => i.location?.lat && i.location?.lng).length,
          reportsWithAI: userIssues.filter((i) => i.aiClassification?.confirmedByUser).length,
          resolvedReports: userIssues.filter((i) => i.status === 'resolved').length,
          currentPoints,
        };

        const badgeSet = new Set(current.badges || []);
        if (badgeStats.totalReports >= 1) badgeSet.add('first_report');
        if (badgeStats.totalReports >= 3) badgeSet.add('reporter_3');
        if (badgeStats.reportsWithLocation >= 1) badgeSet.add('geo_scout');
        if (badgeStats.reportsWithAI >= 1) badgeSet.add('ai_partner');
        if (badgeStats.resolvedReports >= 1) badgeSet.add('problem_solver');
        if (badgeStats.currentPoints >= 500) badgeSet.add('city_guardian');

        const resolvedBadges = Array.from(badgeSet);
        const pointsNeedUpdate = currentPoints > (current.points || 0);
        const badgesNeedUpdate = resolvedBadges.length > (current.badges || []).length;

        if (pointsNeedUpdate || badgesNeedUpdate) {
          const healed = {
            ...current,
            points: currentPoints,
            badges: resolvedBadges,
          };
          saveCurrentUser(healed);
          setUser(healed);
        }
      } catch (e) {
        console.warn('Failed to sync report points and badges:', e);
      }
    }
  }, []);

  const loginDemo = (roleOrName = 'citizen', options = {}) => {
    let config = { role: 'citizen' };
    if (typeof roleOrName === 'string') {
      if (roleOrName === 'official' || roleOrName === 'citizen') {
        config = { role: roleOrName, ...options };
      } else {
        config = { role: 'citizen', name: roleOrName, ...options };
      }
    } else if (typeof roleOrName === 'object' && roleOrName !== null) {
      config = { role: 'citizen', ...roleOrName };
    }

    const demo = createDemoUser(config);
    const existing = getCurrentUser();
    // Preserve existing points and badges if logging in as demo user again
    const finalUser = {
      ...demo,
      points: existing?.points || 0,
      badges: existing?.badges || [],
    };
    saveCurrentUser(finalUser);
    setUser(finalUser);
    return finalUser;
  };

  const loginGoogle = async (role = 'citizen', officialDetails = {}) => {
    setLoading(true);
    try {
      const gUser = await loginWithGoogle(role, officialDetails);
      const existing = getCurrentUser();
      const finalUser = {
        ...gUser,
        points: existing?.points || 0,
        badges: existing?.badges || [],
      };
      saveCurrentUser(finalUser);
      setUser(finalUser);
      return finalUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await logoutFirebase();
    clearCurrentUser();
    setUser(null);
  };

  const awardPoints = (amount) => {
    const current = getCurrentUser() || user;
    if (!current) return 0;
    const nextPoints = (current.points || 0) + amount;
    const updated = {
      ...current,
      points: nextPoints,
    };
    saveCurrentUser(updated);
    setUser(updated);
    return nextPoints;
  };

  const addBadges = (newBadgeIds) => {
    if (!newBadgeIds || newBadgeIds.length === 0) return;
    const current = getCurrentUser() || user;
    if (!current) return;
    const currentBadges = new Set(current.badges || []);
    newBadgeIds.forEach((id) => currentBadges.add(id));
    const updated = {
      ...current,
      badges: Array.from(currentBadges),
    };
    saveCurrentUser(updated);
    setUser(updated);
  };

  const levelInfo = getLevel(user?.points || 0);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isOfficial: user?.role === 'official',
        isCitizen: user?.role !== 'official',
        isFirebaseAvailable: isFirebaseConfigured(),
        loginDemo,
        loginGoogle,
        logout,
        awardPoints,
        addBadges,
        levelInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

