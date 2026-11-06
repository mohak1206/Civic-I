import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, MapPin, Trophy, Camera, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export function Login() {
  const { loginGoogle, loginDemo, isFirebaseAvailable, isAuthenticated } = useAuth();
  const [demoName, setDemoName] = useState('');
  const [showDemoCustom, setShowDemoCustom] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google sign-in was canceled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (e) => {
    e.preventDefault();
    loginDemo(demoName.trim() || 'Palghar Citizen');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-4">
          <Shield className="w-9 h-9 text-zinc-950" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Smart City Reporter
          </h1>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
            Palghar City, Maharashtra
          </span>
        </div>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          AI-assisted civic hazard reporting. Empowering citizens to report potholes, garbage, street lights, and damaged structures.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="space-y-5 p-6 sm:p-8 bg-zinc-900/90 border-zinc-800 shadow-2xl">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Feature Pillars */}
          <div className="grid grid-cols-3 gap-2 py-2 text-center border-y border-zinc-800/80 text-[11px] text-zinc-400">
            <div className="flex flex-col items-center gap-1">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Photo Capture</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Local Ollama AI</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Google Maps</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* Google Login (Firebase Auth) */}
            {isFirebaseAvailable ? (
              <Button
                variant="primary"
                className="w-full py-3"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                {loading ? 'Signing in...' : 'Sign in with Google'}
              </Button>
            ) : (
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-400 text-center">
                <span className="font-semibold text-zinc-300 block mb-0.5">Firebase Keys Not Detected</span>
                Use the Demo Citizen sign-in below for instant local testing.
              </div>
            )}

            {/* Clearly Labelled Demo Login */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-900 px-2 text-zinc-500 font-semibold tracking-wider">
                  Or Test Locally
                </span>
              </div>
            </div>

            <Button
              variant="demo"
              className="w-full py-2.5 font-bold"
              onClick={handleDemoLogin}
            >
              <Badge variant="demo" size="xs">
                DEMO
              </Badge>
              <span>Sign in as Demo Citizen</span>
            </Button>

            {!showDemoCustom ? (
              <button
                type="button"
                onClick={() => setShowDemoCustom(true)}
                className="w-full text-center text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors pt-1"
              >
                + Custom citizen name?
              </button>
            ) : (
              <form onSubmit={handleDemoLogin} className="pt-2 space-y-2">
                <input
                  type="text"
                  placeholder="Enter your citizen name..."
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Button type="submit" size="sm" variant="secondary" className="w-full text-xs">
                  Continue with Custom Name
                </Button>
              </form>
            )}
          </div>

          <p className="text-[10px] text-zinc-500 text-center border-t border-zinc-800/80 pt-3">
            Civic-I Privacy Rule: Reporter personal details are never public and never sent to an LLM.
          </p>
        </Card>
      </div>
    </div>
  );
}

