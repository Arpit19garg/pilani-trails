// src/components/AdminReview.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import "./AdminReview.css";

// ✅ Consistent admin role check
function isAdminOf(currentUser) {
  if (!currentUser) return false;
  if (currentUser.isAdmin === true) return true;
  if (currentUser.admin === true) return true;
  if (currentUser.role === "admin") return true;
  if (typeof currentUser.isAdmin === "string" && currentUser.isAdmin.toLowerCase() === "true")
    return true;
  return false;
}

function normalizeCreatedAt(createdAt) {
  if (!createdAt) return "—";
  if (createdAt.seconds) return new Date(createdAt.seconds * 1000).toLocaleString();
  try {
    return new Date(createdAt).toLocaleString();
  } catch {
    return String(createdAt);
  }
}

const AdminReview = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [fetchError, setFetchError] = useState(null);

  const isAdmin = isAdminOf(currentUser);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    fetchProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, authLoading, currentUser]);

  const fetchProposals = async () => {
    setFetchError(null);
    try {
      setLoading(true);
      const proposalsRef = collection(db, "locationProposals");
      let q;
      if (filter === "all") q = proposalsRef;
      else q = query(proposalsRef, where("status", "==", filter));

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      setProposals(docs);
    } catch (err) {
      console.error("[AdminReview] fetchProposals error:", err);
      setFetchError(err?.message || String(err));
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Approve
  const handleApprove = async (id) => {
    if (!isAdmin) return alert("Admin only");
    try {
      await updateDoc(doc(db, "locationProposals", id), {
        status: "approved",
        reviewedBy: currentUser?.email || currentUser?.uid || "admin",
        reviewedAt: new Date().toISOString(),
      });
      alert("Proposal approved!");
      fetchProposals();
    } catch (err) {
      console.error("Approve error:", err);
      alert("Approve failed: " + err.message);
    }
  };

  // ✅ Reject
  const handleReject = async (id) => {
    if (!isAdmin) return alert("Admin only");
    const reason = prompt("Reason for rejection?");
    if (!reason) return;
    try {
      await updateDoc(doc(db, "locationProposals", id), {
        status: "rejected",
        rejectionReason: reason,
        reviewedBy: currentUser?.email || currentUser?.uid || "admin",
        reviewedAt: new Date().toISOString(),
      });
      alert("Proposal rejected!");
      fetchProposals();
    } catch (err) {
      console.error("Reject error:", err);
      alert("Reject failed: " + err.message);
    }
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!isAdmin) return alert("Admin only");
    if (!window.confirm("Delete this location permanently?")) return;
    try {
      await deleteDoc(doc(db, "locationProposals", id));
      alert("Location deleted!");
      fetchProposals();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed: " + err.message);
    }
  };

  // ✅ Edit
  const startEditing = (proposal) => {
    setEditingId(proposal.id);
    setEditData({
      name: proposal.name || "",
      description: proposal.description || "",
      category: proposal.category || "",
      tags: proposal.tags || "",
      latitude: proposal.latitude ?? proposal.lat ?? "",
      longitude: proposal.longitude ?? proposal.lng ?? "",
      imageUrl: proposal.imageUrl || "",
    });
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async (id) => {
    if (!isAdmin) return alert("Admin only");
    try {
      const payload = {
        ...editData,
        editedBy: currentUser?.email || currentUser?.uid || "admin",
        editedAt: new Date().toISOString(),
      };
      if (payload.latitude !== "") payload.latitude = parseFloat(payload.latitude);
      if (payload.longitude !== "") payload.longitude = parseFloat(payload.longitude);
      await updateDoc(doc(db, "locationProposals", id), payload);
      alert("Changes saved successfully!");
      setEditingId(null);
      fetchProposals();
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed: " + err.message);
    }
  };

  // ================= RENDER =================
  if (authLoading) return <div className="admin-review-loading">Checking authentication...</div>;

  if (!isAdmin) {
    return (
      <div className="admin-review-container">
        <div className="admin-review-header">
          <h1>Admin Control Panel</h1>
          <p>Only admins can view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="admin-review-loading">Loading proposals...</div>;

  return (
    <div className="admin-review-container">
      <div className="admin-review-header">
        <h1>Admin Control Panel</h1>
        <p>Approve, edit, or delete any proposed location</p>
      </div>

      <div className="filter-section" style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>Filter:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {fetchError && (
        <div style={{ color: "crimson", marginBottom: 12 }}>
          Error fetching proposals: {fetchError}
        </div>
      )}

      {proposals.length === 0 ? (
        <div className="no-proposals">No proposals found.</div>
      ) : (
        <div className="proposals-grid">
          {proposals.map((p) => (
            <div key={p.id} className="proposal-card">
              <div className="proposal-header">
                {editingId === p.id ? (
                  <input
                    value={editData.name}
                    onChange={(e) => handleEditChange("name", e.target.value)}
                    className="edit-input"
                    placeholder="Name"
                  />
                ) : (
                  <h3 style={{ margin: 0 }}>{p.name}</h3>
                )}
                <span className={`status-badge ${p.status}`}>{p.status}</span>
              </div>

              <div className="proposal-details" style={{ marginTop: 8 }}>
                {editingId === p.id ? (
                  <>
                    <label>Description:</label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => handleEditChange("description", e.target.value)}
                    />
                    <label>Category:</label>
                    <input
                      value={editData.category}
                      onChange={(e) => handleEditChange("category", e.target.value)}
                    />
                    <label>Tags:</label>
                    <input
                      value={editData.tags}
                      onChange={(e) => handleEditChange("tags", e.target.value)}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <input
                        style={{ flex: 1 }}
                        placeholder="Latitude"
                        value={editData.latitude}
                        onChange={(e) => handleEditChange("latitude", e.target.value)}
                      />
                      <input
                        style={{ flex: 1 }}
                        placeholder="Longitude"
                        value={editData.longitude}
                        onChange={(e) => handleEditChange("longitude", e.target.value)}
                      />
                    </div>
                    <label>Image URL:</label>
                    <input
                      value={editData.imageUrl}
                      onChange={(e) => handleEditChange("imageUrl", e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <p><strong>Description:</strong> {p.description || "—"}</p>
                    <p><strong>Category:</strong> {p.category || "—"}</p>
                    <p><strong>Tags:</strong> {p.tags || "—"}</p>
                    <p><strong>Lat:</strong> {p.latitude ?? p.lat ?? "—"}, <strong>Lng:</strong> {p.longitude ?? p.lng ?? "—"}</p>
                    <p><strong>By:</strong> {p.proposedBy || p.userEmail || "—"}</p>
                    <p><strong>Submitted:</strong> {normalizeCreatedAt(p.createdAt)}</p>
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        style={{ width: "100%", borderRadius: 8, marginTop: 8 }}
                      />
                    )}
                  </>
                )}
              </div>

              <div className="proposal-actions" style={{ marginTop: 10 }}>
                {editingId === p.id ? (
                  <>
                    <button onClick={() => saveEdit(p.id)} className="btn btn-save">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn btn-cancel">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleApprove(p.id)} className="btn btn-approve">
                      Approve
                    </button>
                    <button onClick={() => handleReject(p.id)} className="btn btn-reject">
                      Reject
                    </button>
                    <button onClick={() => startEditing(p)} className="btn btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="btn btn-delete">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReview;
