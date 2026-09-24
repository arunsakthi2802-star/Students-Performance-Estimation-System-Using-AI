import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Shield, UserCheck, BookOpen, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      // Route to role-specific dashboard
      if (loggedUser.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (loggedUser.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(demoEmail, demoPass);
      if (loggedUser.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (loggedUser.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-tr from-blue-700 to-indigo-500 text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign in to EduEstimate
          </h2>
          <p className="text-xs text-slate-500">
            Students Performance Estimation System • <span className="font-semibold text-slate-700">Nithyasri S</span>
          </p>
        </div>

        {/* 1-Click Fast Demo Logins */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
            Fast Demonstration Logins
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student@college.edu', 'Student123!')}
              disabled={loading}
              className="flex flex-col items-center p-2.5 rounded-xl border border-blue-100 bg-blue-50/60 hover:bg-blue-100/70 hover:border-blue-300 transition-all text-center group cursor-pointer"
            >
              <UserCheck className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">Student</span>
              <span className="text-[10px] text-blue-600">Nithyasri S</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('teacher@college.edu', 'Teacher123!')}
              disabled={loading}
              className="flex flex-col items-center p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-100/70 hover:border-indigo-300 transition-all text-center group cursor-pointer"
            >
              <BookOpen className="w-5 h-5 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">Faculty</span>
              <span className="text-[10px] text-indigo-600">Teacher Role</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin@college.edu', 'Admin123!')}
              disabled={loading}
              className="flex flex-col items-center p-2.5 rounded-xl border border-purple-100 bg-purple-50/60 hover:bg-purple-100/70 hover:border-purple-300 transition-all text-center group cursor-pointer"
            >
              <Shield className="w-5 h-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">Admin</span>
              <span className="text-[10px] text-purple-600">System Admin</span>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            <span>Don't have an account? </span>
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">
              Register here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
