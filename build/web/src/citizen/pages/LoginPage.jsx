import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Cpu,
  MapPin,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { SectionLabel, CornerFrame, Card, Button, Badge } from '@shared-ui';
import { useAuth } from '../context/AuthContext';
import { validateUsername, validatePassword } from '../api/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, demoLogin } = useAuth();

  const [tab, setTab] = useState('citizen'); // 'citizen' | 'official'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

  const validate = () => {
    const errs = {};
    const uRes = validateUsername(username);
    if (!uRes.valid) errs.username = uRes.error;

    const pRes = validatePassword(password);
    if (!pRes.valid) errs.password = pRes.error;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await login(username, password, tab);
      const redirectPath = tab === 'official' ? '/official' : '/dashboard';
      navigate(location.state?.from?.pathname || redirectPath, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSignIn = () => {
    demoLogin(tab);
    const redirectPath = tab === 'official' ? '/official' : '/dashboard';
    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Header Column */}
        <div className="text-center space-y-2">
          <SectionLabel className="justify-center">Sign In</SectionLabel>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-heading">
            Welcome to Civic-I
          </h1>
          <div className="inline-block">
            <span className="label-xs px-2.5 py-1 bg-navy/10 text-navy border border-navy/20 rounded-card font-heading">
              PALGHAR CITY, MAHARASHTRA
            </span>
          </div>
          <p className="font-body text-text-body text-sm pt-1">
            Residents report, officials review.
          </p>
        </div>

        {/* Card inside CornerFrame */}
        <CornerFrame color={tab === 'citizen' ? 'orange' : 'navy'} size={24}>
          <div className="border border-card-border bg-card rounded-card shadow-sm p-6 sm:p-8 space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-navy/10">
              <button
                type="button"
                onClick={() => {
                  setTab('citizen');
                  setServerError('');
                  setErrors({});
                }}
                className={`flex-1 pb-3 text-center font-heading text-xs uppercase tracking-label font-bold transition-all ${
                  tab === 'citizen'
                    ? 'text-accent-orange border-b-2 border-navy -mb-px'
                    : 'text-text-muted hover:text-text-heading'
                }`}
              >
                Citizen Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('official');
                  setServerError('');
                  setErrors({});
                }}
                className={`flex-1 pb-3 text-center font-heading text-xs uppercase tracking-label font-bold transition-all ${
                  tab === 'official'
                    ? 'text-accent-orange border-b-2 border-navy -mb-px'
                    : 'text-text-muted hover:text-text-heading'
                }`}
              >
                Official Login
              </button>
            </div>

            {/* Three small icon items */}
            <div className="grid grid-cols-3 gap-2 py-1 border-b border-navy/10 text-center">
              <div className="flex flex-col items-center gap-1 p-2">
                <Camera className="w-4 h-4 text-accent-orange" />
                <span className="text-[10px] font-heading uppercase tracking-label font-medium text-text-heading">
                  Photo Upload
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2">
                <Cpu className="w-4 h-4 text-accent-blue" />
                <span className="text-[10px] font-heading uppercase tracking-label font-medium text-text-heading">
                  AI Suggestion
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2">
                <MapPin className="w-4 h-4 text-accent-gold" />
                <span className="text-[10px] font-heading uppercase tracking-label font-medium text-text-heading">
                  OpenStreetMap
                </span>
              </div>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-card font-body">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div>
                <label className="block label-xs text-text-heading mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-navy/40">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username) setErrors((prev) => ({ ...prev, username: null }));
                    }}
                    placeholder="Enter your username"
                    autoComplete="username"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-card-border rounded-card text-sm font-body text-text-heading placeholder-text-muted focus:outline-none focus:border-accent-orange"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs text-red-600 font-body">{errors.username}</p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label className="block label-xs text-text-heading mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-navy/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                    }}
                    placeholder="At least 8 characters"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2 bg-white border border-card-border rounded-card text-sm font-body text-text-heading placeholder-text-muted focus:outline-none focus:border-accent-orange"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-navy/40 hover:text-navy"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 font-body">{errors.password}</p>
                )}
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="w-full justify-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Registration link or Official notice */}
            <div className="text-center pt-1 text-xs font-body">
              {tab === 'citizen' ? (
                <p className="text-text-body">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-accent-orange font-heading font-semibold hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              ) : (
                <p className="text-text-muted italic">
                  Official accounts are created by an administrator.
                </p>
              )}
            </div>

            {/* Demo Login for local test */}
            {isMock && (
              <div className="space-y-3 pt-2">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-navy/15 w-full"></div>
                  <span className="bg-card px-2 label-xs text-text-muted absolute">
                    OR TEST LOCALLY
                  </span>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="gold-outline"
                    showArrow={false}
                    onClick={handleDemoSignIn}
                    className="w-full justify-center"
                  >
                    <span>Sign in as Demo {tab === 'citizen' ? 'Citizen' : 'Official'}</span>
                    <Badge color="gold" className="ml-2">DEMO</Badge>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CornerFrame>

        {/* Privacy reminder footer */}
        <div className="flex items-center justify-center gap-2 text-center text-xs text-text-muted font-body">
          <ShieldAlert className="w-4 h-4 text-text-muted shrink-0" />
          <span>Do not upload photos showing faces or number plates.</span>
        </div>
      </div>
    </div>
  );
}
