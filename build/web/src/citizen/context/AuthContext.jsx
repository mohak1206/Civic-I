import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi } from '../api/auth';

const AuthContext = createContext(null);

const SESSION_TOKEN_KEY = 'civici_auth_token';
const SESSION_USER_KEY = 'civici_auth_user';

export function AuthProvider({ children }) {
  // In-memory state initialized from sessionStorage
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const role = user?.role || null;

  const login = async (username, password, selectedRole = 'citizen') => {
    const res = await loginApi(username, password, selectedRole);
    setToken(res.token);
    setUser(res.user);

    try {
      sessionStorage.setItem(SESSION_TOKEN_KEY, res.token);
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.user));
    } catch (e) {
      console.warn('sessionStorage unavailable');
    }

    return res.user;
  };

  const register = async (username, password) => {
    const res = await registerApi(username, password);
    setToken(res.token);
    setUser(res.user);

    try {
      sessionStorage.setItem(SESSION_TOKEN_KEY, res.token);
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.user));
    } catch (e) {
      console.warn('sessionStorage unavailable');
    }

    return res.user;
  };

  const demoLogin = (selectedRole = 'citizen') => {
    const isCitizen = selectedRole === 'citizen';
    const demoUser = {
      username: isCitizen ? 'palghar_citizen' : 'palghar_official_triage',
      role: selectedRole,
      isDemo: true,
    };
    const mockToken = `demo-token-${Date.now()}`;

    setToken(mockToken);
    setUser(demoUser);

    try {
      sessionStorage.setItem(SESSION_TOKEN_KEY, mockToken);
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(demoUser));
    } catch (e) {
      console.warn('sessionStorage unavailable');
    }

    return demoUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_USER_KEY);
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        isAuthenticated: !!token && !!user,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

