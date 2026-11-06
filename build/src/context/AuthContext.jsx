import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, saveCurrentUser, clearCurrentUser } from '../services/storage';
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
    if (!user) return;
    const nextPoints = (user.points || 0) + amount;
    const updated = {
      ...user,
      points: nextPoints,
    };
    saveCurrentUser(updated);
    setUser(updated);
    return nextPoints;
  };

  const addBadges = (newBadgeIds) => {
    if (!user || !newBadgeIds || newBadgeIds.length === 0) return;
    const current = new Set(user.badges || []);
    newBadgeIds.forEach((id) => current.add(id));
    const updated = {
      ...user,
      badges: Array.from(current),
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

