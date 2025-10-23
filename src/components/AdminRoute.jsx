// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function isAdminOf(user) {
  if (!user) return false;
  if (user.isAdmin === true) return true;
  if (user.admin === true) return true;
  if (user.role === 'admin') return true;
  if (typeof user.isAdmin === 'string' && user.isAdmin.toLowerCase() === 'true') return true;
  return false;
}

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // While auth is initializing, show a simple loader (prevents redirect jitter)
  if (loading) {
    return <div style={{padding:20}}>Checking permissions...</div>;
  }

  // If not logged in -> redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but not admin -> show Access Denied (or redirect to login)
  if (!isAdminOf(currentUser)) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <h2>Access denied</h2>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  // Otherwise, render children (admin allowed)
  return children;
};

export default AdminRoute;
