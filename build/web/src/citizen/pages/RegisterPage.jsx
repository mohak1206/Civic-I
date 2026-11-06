import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { SectionLabel, CornerFrame, Card, Button } from '@shared-ui';
import { useAuth } from '../context/AuthContext';
import { validateUsername, validatePassword } from '../api/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    const uRes = validateUsername(username);
    if (!uRes.valid) errs.username = uRes.error;

    const pRes = validatePassword(password);
    if (!pRes.valid) errs.password = pRes.error;

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      await register(username, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Header Column */}
        <div className="text-center space-y-2">
          <SectionLabel className="justify-center">Registration</SectionLabel>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-heading">
            Join Civic-I
          </h1>
          <div className="inline-block">
            <span className="label-xs px-2.5 py-1 bg-navy/10 text-navy border border-navy/20 rounded-card font-heading">
              PALGHAR CITIZEN ACCOUNT
            </span>
          </div>
          <p className="font-body text-text-body text-sm pt-1">
            Create an account to report issues and track resolutions.
          </p>
        </div>

        {/* Card inside CornerFrame */}
        <CornerFrame color="orange" size={24}>
          <div className="border border-card-border bg-card rounded-card shadow-sm p-6 sm:p-8 space-y-6">
            {serverError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-card font-body">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

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
                    placeholder="Choose a username"
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
                    autoComplete="new-password"
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

              {/* Confirm Password field */}
              <div>
                <label className="block label-xs text-text-heading mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-navy/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
                    }}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-card-border rounded-card text-sm font-body text-text-heading placeholder-text-muted focus:outline-none focus:border-accent-orange"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 font-body">{errors.confirmPassword}</p>
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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="text-center pt-2 text-xs font-body">
              <p className="text-text-body">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-accent-orange font-heading font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </CornerFrame>

        {/* Privacy reminder footer */}
        <div className="flex items-center justify-center gap-2 text-center text-xs text-text-muted font-body">
          <ShieldAlert className="w-4 h-4 text-text-muted shrink-0" />
          <span>No email or phone required for the prototype MVP.</span>
        </div>
      </div>
    </div>
  );
}
