import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Background3D from './components/Background3D';

// Route guard
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login"     element={<Login />} />
    <Route path="/signup"    element={<Signup />} />
    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    <Route path="*"          element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <Router>
      {/* 3D background on every page */}
      <Background3D />
      <div className="relative z-10">
        <AppRoutes />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '8px', fontSize: '14px' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </Router>
  </AuthProvider>
);

export default App;
