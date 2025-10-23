// src/components/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

// ✅ Checks all possible admin markers in your Firestore user doc
function isAdminOf(user) {
  if (!user) return false;
  if (user.isAdmin === true) return true;
  if (user.admin === true) return true;
  if (user.role === "admin") return true;
  if (typeof user.isAdmin === "string" && user.isAdmin.toLowerCase() === "true")
    return true;
  return false;
}

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 20 }}>Checking admin permissions...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminOf(currentUser)) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You must be an admin to access this page.</p>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
