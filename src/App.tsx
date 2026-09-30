/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Home from './components/Home';
import EvidenceIntake from './components/EvidenceIntake';
import Vault from './components/Vault';
import AuditLog from './components/AuditLog';
import Contact from './components/Contact';
import AdminDashboard from './components/AdminDashboard';
import { ComplaintCenter } from './components/ComplaintCenter';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import SmoothScroll from './components/SmoothScroll';
import { useStore } from './store';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, setCurrentUser } = useStore();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (currentUser) {
      setLoading(false);
      return;
    }

    // Check backend session as fallback
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUser, setCurrentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center font-mono text-zinc-300 gap-3">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs tracking-[0.3em] uppercase text-zinc-400">VERIFYING ENCLAVE CLEARANCE...</span>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }
  return <>{children}</>;
};

// Layout Wrapper to conditionally hide Layout/Navbar on Dashboard routes
const AppRoutes = () => {
  const location = useLocation();

  // We use the full-screen layout for /vault and /admin
  const isDashboardLayout = 
    location.pathname === '/vault' || 
    location.pathname === '/admin';

  if (isDashboardLayout) {
    return (
      <Routes>
        <Route 
          path="/vault" 
          element={
            <ProtectedRoute>
              <Vault />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    );
  }

  return (
    <Layout>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Protected Routes */}
        <Route 
          path="/intake" 
          element={
            <ProtectedRoute>
              <EvidenceIntake />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/audit" 
          element={
            <ProtectedRoute>
              <AuditLog />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/complaints" 
          element={
            <ProtectedRoute>
              <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
                <ComplaintCenter />
              </div>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Layout>
  );
};

export default function App() {
  return (
    <Router>
      <SmoothScroll>
        <AppRoutes />
      </SmoothScroll>
    </Router>
  );
}
