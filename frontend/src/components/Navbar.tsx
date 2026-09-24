import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Sliders, 
  UploadCloud, 
  Cpu, 
  FileText, 
  Users, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Project Attribution */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">EduEstimate AI</span>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">v1.0</span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Student Performance System • <span className="font-medium text-slate-700">Nithyasri S</span>
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {!user ? (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/estimate"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/estimate') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>AI Estimation Studio</span>
                </Link>
                <Link
                  to="/models"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/models') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  ML Models
                </Link>
                <div className="h-5 w-px bg-slate-200 mx-2" />
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-xs shadow-blue-500/20 transition-all hover:shadow-md"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {/* Role-specific Dashboard Link */}
                {user.role === 'student' && (
                  <Link
                    to="/student-dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                      isActive('/student-dashboard') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>My Dashboard</span>
                  </Link>
                )}

                {user.role === 'teacher' && (
                  <Link
                    to="/teacher-dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                      isActive('/teacher-dashboard') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Faculty Dashboard</span>
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin-dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                      isActive('/admin-dashboard') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* Common feature links */}
                <Link
                  to="/estimate"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/estimate') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  <span>AI Estimation Studio</span>
                </Link>

                {(user.role === 'teacher' || user.role === 'admin') && (
                  <>
                    <Link
                      to="/upload-dataset"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                        isActive('/upload-dataset') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      <UploadCloud className="w-4 h-4 text-emerald-500" />
                      <span>Dataset Ingestion</span>
                    </Link>
                  </>
                )}

                <Link
                  to="/models"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/models') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-purple-500" />
                  <span>ML Registry</span>
                </Link>

                <Link
                  to="/reports"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/reports') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Reports</span>
                </Link>

                <Link
                  to="/mongodb"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/mongodb') ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>MongoDB Atlas</span>
                </Link>

                {/* User Dropdown / Profile Badge */}
                <div className="h-6 w-px bg-slate-200 mx-2" />
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 pl-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="text-left text-xs leading-tight">
                      <p className="font-semibold text-slate-800">{user.full_name}</p>
                      <p className="text-slate-500 capitalize">{user.role} {user.student_id ? `(${user.student_id})` : ''}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {!user ? (
            <>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-medium text-slate-700">Home</Link>
              <Link to="/estimate" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-medium text-slate-700">AI Estimation Studio</Link>
              <Link to="/models" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-medium text-slate-700">ML Models</Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-medium text-blue-600">Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-medium text-slate-900 bg-blue-50">Register Account</Link>
            </>
          ) : (
            <>
              {user.role === 'student' && (
                <Link to="/student-dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-medium text-slate-800">My Dashboard</Link>
              )}
              {user.role === 'teacher' && (
                <Link to="/teacher-dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-medium text-slate-800">Faculty Dashboard</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin-dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-medium text-slate-800">Admin Panel</Link>
              )}
              <Link to="/estimate" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-medium text-slate-800">AI Estimation Studio</Link>
              <Link to="/upload-dataset" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-medium text-slate-800">Dataset Ingestion</Link>
              <Link to="/models" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-medium text-slate-800">ML Model Registry</Link>
              <Link to="/reports" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-medium text-slate-800">Reports</Link>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500">{user.full_name} ({user.role})</span>
                <button onClick={handleLogout} className="text-xs text-rose-600 font-semibold">Sign Out</button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
