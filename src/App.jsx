import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './LandingPage';
import SiteLogin from './components/auth/SiteLogin';
import UserDashboard from './components/dashboard/UserDashboard';
import FamilySorter from './components/FamilySorter/FamilySorter';

// Protected Route Component
const ProtectedRoute = ({ children, requiredApp = null }) => {
  const { user, userProfile, hasAccess, isLoading } = useAuth();
 
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
      }}>
        Loading...
      </div>
    );
  }
 
  if (!user || !userProfile) {
    return <Navigate to="/login" replace />;
  }
 
  if (requiredApp && !hasAccess(requiredApp)) {
    return <Navigate to="/dashboard" replace />;
  }
 
  return children;
};

// Main App Routes
const AppRoutes = () => {
  const { user, userProfile } = useAuth();
 
  return (
    <Routes>
      {/* Public/Home Route - now accessible to all users */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={!userProfile ? <SiteLogin /> : <Navigate to="/dashboard" />} />
     
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
     
      <Route
        path="/sorting"
        element={
          <ProtectedRoute requiredApp="sorting">
            <FamilySorter />
          </ProtectedRoute>
        }
      />
     
      {/* Future protected routes */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute requiredApp="analytics">
            <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Segoe UI' }}>
              <h1>Analytics Dashboard</h1>
              <p>Coming Soon...</p>
            </div>
          </ProtectedRoute>
        }
      />
     
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredApp="admin">
            <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Segoe UI' }}>
              <h1>Admin Panel</h1>
              <p>Coming Soon...</p>
            </div>
          </ProtectedRoute>
        }
      />
     
      {/* Catch all route */}
      <Route path="*" element={<Navigate to={userProfile ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;