import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../build/web/src/citizen/components/ProtectedRoute';
import * as authContext from '../../build/web/src/citizen/context/AuthContext';
import { loginApi, registerApi } from '../../build/web/src/citizen/api/auth';

describe('A5 Auth Flow & ProtectedRoute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('loginApi and registerApi (mock mode)', () => {
    it('loginApi returns a valid JWT token and citizen user object', async () => {
      const res = await loginApi('palghar_citizen', 'password123', 'citizen');
      expect(res).toHaveProperty('token');
      expect(res.token.split('.')).toHaveLength(3);
      expect(res.user.username).toBe('palghar_citizen');
      expect(res.user.role).toBe('citizen');
    });

    it('loginApi returns official role when logging in as official', async () => {
      const res = await loginApi('official_ward_4', 'password123', 'official');
      expect(res.user.role).toBe('official');
      expect(res.user.username).toBe('official_ward_4');
    });

    it('registerApi creates citizen account with JWT', async () => {
      const res = await registerApi('new_reporter', 'securePass123');
      expect(res.token).toBeDefined();
      expect(res.user.username).toBe('new_reporter');
      expect(res.user.role).toBe('citizen');
    });

    it('loginApi handles credential failure gracefully', async () => {
      await expect(loginApi('any_user', 'fail_test')).rejects.toThrow('Invalid username or password.');
    });
  });

  describe('ProtectedRoute redirects', () => {
    it('redirects unauthenticated user away from protected child', () => {
      vi.spyOn(authContext, 'useAuth').mockReturnValue({
        isAuthenticated: false,
        user: null,
        role: null,
      });

      const html = renderToString(
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/dashboard'] },
          React.createElement(
            Routes,
            null,
            React.createElement(Route, {
              path: '/dashboard',
              element: React.createElement(
                ProtectedRoute,
                { allowedRoles: ['citizen'] },
                React.createElement('div', null, 'SECRET_DASHBOARD')
              ),
            }),
            React.createElement(Route, {
              path: '/login',
              element: React.createElement('div', null, 'LOGIN_PAGE'),
            })
          )
        )
      );

      expect(html).not.toContain('SECRET_DASHBOARD');
    });

    it('renders protected child when authenticated with allowed role', () => {
      vi.spyOn(authContext, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        user: { username: 'mohak_palghar', role: 'citizen' },
        role: 'citizen',
      });

      const html = renderToString(
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/dashboard'] },
          React.createElement(
            Routes,
            null,
            React.createElement(Route, {
              path: '/dashboard',
              element: React.createElement(
                ProtectedRoute,
                { allowedRoles: ['citizen'] },
                React.createElement('div', null, 'SECRET_CITIZEN_DASHBOARD')
              ),
            }),
            React.createElement(Route, {
              path: '/login',
              element: React.createElement('div', null, 'LOGIN_PAGE'),
            })
          )
        )
      );

      expect(html).toContain('SECRET_CITIZEN_DASHBOARD');
    });

    it('blocks citizen from accessing official portal', () => {
      vi.spyOn(authContext, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        user: { username: 'citizen_user', role: 'citizen' },
        role: 'citizen',
      });

      const html = renderToString(
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/official'] },
          React.createElement(
            Routes,
            null,
            React.createElement(Route, {
              path: '/official',
              element: React.createElement(
                ProtectedRoute,
                { allowedRoles: ['official'] },
                React.createElement('div', null, 'OFFICIAL_CONTROL_PANEL')
              ),
            }),
            React.createElement(Route, {
              path: '/login',
              element: React.createElement('div', null, 'LOGIN_PAGE'),
            })
          )
        )
      );

      expect(html).not.toContain('OFFICIAL_CONTROL_PANEL');
    });

    it('allows official to access official portal', () => {
      vi.spyOn(authContext, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        user: { username: 'pmc_engineer', role: 'official' },
        role: 'official',
      });

      const html = renderToString(
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/official'] },
          React.createElement(
            Routes,
            null,
            React.createElement(Route, {
              path: '/official',
              element: React.createElement(
                ProtectedRoute,
                { allowedRoles: ['official'] },
                React.createElement('div', null, 'OFFICIAL_CONTROL_PANEL')
              ),
            })
          )
        )
      );

      expect(html).toContain('OFFICIAL_CONTROL_PANEL');
    });
  });
});

