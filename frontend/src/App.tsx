import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { EstimationStudio } from './pages/EstimationStudio';
import { DatasetUploadPage } from './pages/DatasetUploadPage';
import { ModelStudioPage } from './pages/ModelStudioPage';
import { StudentDetailPage } from './pages/StudentDetailPage';
import { ReportsPage } from './pages/ReportsPage';
import { MongoStudioPage } from './pages/MongoStudioPage';

interface ProtectedProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's permitted dashboard
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher-dashboard" replace />;
    return <Navigate to="/student-dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/estimate" element={<EstimationStudio />} />
          <Route path="/models" element={<ModelStudioPage />} />

          {/* Protected Routes */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin', 'teacher']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher-dashboard"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/upload-dataset"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <DatasetUploadPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/students/:studentId"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                <StudentDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/student/:studentId"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mongodb"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                <MongoStudioPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
