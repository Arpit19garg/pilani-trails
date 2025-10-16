// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect if user is not logged in or not an admin
  if (!currentUser || currentUser?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the protected admin page
  return children;
};

export default AdminRoute;
