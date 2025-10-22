import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import './AdminReview.css';

const AdminReview = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const { currentUser } = useAuth();

  // ✅ Only admin (manually set in Firebase)
  const isAdmin = currentUser?.email === "admin@pilanitrails.com";

  useEffect(() => {
    if (isAdmin) fetchProposals();
  }, [filter, isAdmin]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const proposalsRef = collection(db, 'locationProposals');
      let q;
      if (filter === 'all') q = proposalsRef;
      else q = query(proposalsRef, where('status', '==', filter));

      const snapshot = await getDocs(q);
      setProposals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Error fetching proposals:', err);
      alert('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await updateDoc(doc(db, 'locationProposals', id), {
      status: 'approved',
      reviewedBy: currentUser.email,
      reviewedAt: new Date().toISOString()
    });
    fetchProposals();
  };

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection?');
    if (!reason) return;
    await updateDoc(doc(db, 'locationProposals', id), {
      status: 'rejected',
      rejectionReason: reason,
      reviewedBy: currentUser.email,
      reviewedAt: new Date().toISOString()
    });
    fetchProposals();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this location permanently?')) return;
    await deleteDoc(doc(db, 'locationProposals', id));
    fetchProposals();
  };

  // ✅ Editing handlers
  const startEditing = (proposal) => {
    setEditingId(proposal.id);
    setEditData({
      name: proposal.name || '',
      description: proposal.description || '',
      category: proposal.category || '',
      tags: proposal.tags || '',
    });
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async (id) => {
    try {
      await updateDoc(doc(db, 'locationProposals', id), {
        ...editData,
        editedBy: currentUser.email,
        editedAt: new Date().toISOString(),
      });
      alert('Location updated successfully!');
      setEditingId(null);
      fetchProposals();
    } catch (err) {
      console.error('Error updating location:', err);
      alert('Failed to save changes');
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  if (loading) return <div className="admin-review-loading">Loading proposals...</div>;

  return (
    <div className="admin-review-container">
      <div className="admin-review-header">
        <h1>Admin Control Panel</h1>
        <p>Approve, edit, or delete any location directly</p>
      </div>

      <div className="filter-section">
        <label>Filter:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {proposals.length === 0 ? (
        <p>No proposals found.</p>
      ) : (
        <div className="proposals-grid">
          {proposals.map((p) => (
            <div key={p.id} className="proposal-card">
              <div className="proposal-header">
                {editingId === p.id ? (
                  <input
                    value={editData.name}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <h3>{p.name}</h3>
                )}
                <span className={`status-badge ${p.status}`}>{p.status}</span>
              </div>

              <div className="proposal-details">
                {editingId === p.id ? (
                  <>
                    <label>Description:</label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => handleEditChange('description', e.target.value)}
                    />
                    <label>Category:</label>
                    <input
                      value={editData.category}
                      onChange={(e) => handleEditChange('category', e.target.value)}
                    />
                    <label>Tags:</label>
                    <input
                      value={editData.tags}
                      onChange={(e) => handleEditChange('tags', e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <p><strong>Description:</strong> {p.description}</p>
                    <p><strong>Category:</strong> {p.category}</p>
                    <p><strong>Tags:</strong> {p.tags || '—'}</p>
                    <p><strong>Lat:</strong> {p.latitude}, <strong>Lng:</strong> {p.longitude}</p>
                    <p><strong>By:</strong> {p.proposedBy}</p>
                  </>
                )}
              </div>

              <div className="proposal-actions">
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
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReview;
