// src/components/AdminReview.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import "./AdminReview.css";

// admin check helper
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

// tolerant getter for fields (handles different key casings)
function pickField(obj = {}, cand = []) {
  const map = Object.keys(obj).reduce((acc, k) => {
    acc[k.toLowerCase().replace(/\s+/g, "")] = k;
    return acc;
  }, {});
  for (const c of cand) {
    const key = c.toLowerCase().replace(/\s+/g, "");
    if (map[key]) return obj[map[key]];
  }
  return undefined;
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
      const q = filter === "all" ? proposalsRef : query(proposalsRef, where("status", "==", filter));
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

  // Approve & copy to approvedLocations
  const handleApprove = async (id) => {
    if (!isAdmin) return alert("Admin only");
    try {
      const proposalRef = doc(db, "locationProposals", id);
      const proposalSnap = await getDoc(proposalRef);
      if (!proposalSnap.exists()) {
        alert("Proposal not found!");
        return;
      }
      const proposalData = proposalSnap.data();

      await updateDoc(proposalRef, {
        status: "approved",
        reviewedBy: currentUser?.email || currentUser?.uid || "admin",
        reviewedAt: new Date().toISOString(),
      });

      // add to approvedLocations collection
      await addDoc(collection(db, "approvedLocations"), {
        ...proposalData,
        approvedBy: currentUser?.email || "admin",
        approvedAt: new Date().toISOString(),
      });

      alert("Proposal approved and moved to approved locations!");
      fetchProposals();
    } catch (err) {
      console.error("Approve error:", err);
      alert("Approve failed: " + (err?.message || err));
    }
  };

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
      alert("Reject failed: " + (err?.message || err));
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return alert("Admin only");
    if (!window.confirm("Delete this location permanently?")) return;
    try {
      await deleteDoc(doc(db, "locationProposals", id));
      alert("Location deleted!");
      fetchProposals();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed: " + (err?.message || err));
    }
  };

  const startEditing = (proposal) => {
    setEditingId(proposal.id);
    setEditData({
      name: pickField(proposal, ["name", "Name"]) || "",
      description: pickField(proposal, ["description", "Description"]) || "",
      category: pickField(proposal, ["category", "Category"]) || "",
      tags: pickField(proposal, ["tags", "Tags"]) || "",
      imageUrl: pickField(proposal, ["imageUrl", "image", "Image URL"]) || ""
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
      await updateDoc(doc(db, "locationProposals", id), payload);
      alert("Changes saved successfully!");
      setEditingId(null);
      fetchProposals();
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed: " + (err?.message || err));
    }
  };

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

      {fetchError && <div style={{ color: "crimson", marginBottom: 12 }}>Error fetching proposals: {fetchError}</div>}

      {proposals.length === 0 ? (
        <div className="no-proposals">No proposals found.</div>
      ) : (
        <div className="proposals-grid">
          {proposals.map((p) => {
            const name = pickField(p, ["name", "Name"]) || "—";
            const description = pickField(p, ["description", "Description"]) || "—";
            const category = pickField(p, ["category", "Category"]) || "—";
            const tags = pickField(p, ["tags", "Tags"]) || "—";
            const imageUrl = pickField(p, ["imageUrl", "image", "Image URL"]) || "";
            const proposedBy = pickField(p, ["proposedBy", "Proposed by", "userEmail", "userEmail"]) || p.userEmail || p.userId || "—";
            const createdAt = p.createdAt ? normalizeCreatedAt(p.createdAt) : "—";

            return (
              <div key={p.id} className="proposal-card">
                <div className="proposal-header">
                  {editingId === p.id ? (
                    <input value={editData.name} onChange={(e) => handleEditChange("name", e.target.value)} className="edit-input" placeholder="Name" />
                  ) : (
                    <h3 style={{ margin: 0 }}>{name}</h3>
                  )}
                  <span className={`status-badge ${p.status || 'pending'}`}>{p.status || "pending"}</span>
                </div>

                <div className="proposal-details" style={{ marginTop: 8 }}>
                  {editingId === p.id ? (
                    <>
                      <label>Description:</label>
                      <textarea value={editData.description} onChange={(e) => handleEditChange("description", e.target.value)} />
                      <label>Category:</label>
                      <input value={editData.category} onChange={(e) => handleEditChange("category", e.target.value)} />
                      <label>Tags:</label>
                      <input value={editData.tags} onChange={(e) => handleEditChange("tags", e.target.value)} />
                      <label>Image URL:</label>
                      <input value={editData.imageUrl} onChange={(e) => handleEditChange("imageUrl", e.target.value)} />
                    </>
                  ) : (
                    <>
                      <p><strong>Description:</strong> {description}</p>
                      <p><strong>Category:</strong> {category}</p>
                      <p><strong>Tags:</strong> {tags}</p>
                      <p><strong>By:</strong> {proposedBy}</p>
                      <p><strong>Submitted:</strong> {createdAt}</p>
                      {imageUrl && <img src={imageUrl} alt={name} style={{ width: "100%", borderRadius: 8, marginTop: 8 }} />}
                    </>
                  )}
                </div>

                <div className="proposal-actions" style={{ marginTop: 10 }}>
                  {editingId === p.id ? (
                    <>
                      <button onClick={() => saveEdit(p.id)} className="btn btn-save">Save</button>
                      <button onClick={() => setEditingId(null)} className="btn btn-cancel">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleApprove(p.id)} className="btn btn-approve">Approve</button>
                      <button onClick={() => handleReject(p.id)} className="btn btn-reject">Reject</button>
                      <button onClick={() => startEditing(p)} className="btn btn-edit">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="btn btn-delete">Delete</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminReview;
