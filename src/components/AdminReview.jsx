// src/components/AdminReview.jsx
import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import './AdminReview.css';

const AdminReview = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const { currentUser } = useAuth();

  // Edit modal state
  const [editing, setEditing] = useState(null); // object { id, fields... } or null
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const isAdmin = Boolean(
    currentUser &&
      (currentUser.isAdmin === true || currentUser.admin === true || currentUser.role === 'admin')
  );

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const proposalsRef = collection(db, 'locationProposals');
      let q;

      if (filter === 'all') {
        q = proposalsRef;
      } else {
        q = query(proposalsRef, where('status', '==', filter));
      }

      const querySnapshot = await getDocs(q);
      const proposalsData = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));

      setProposals(proposalsData);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      alert('Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  // Approve: update status and optionally create a location doc
  const handleApprove = async (proposalId) => {
    if (!isAdmin) {
      alert('Only admins can approve proposals.');
      return;
    }
    try {
      const proposalRef = doc(db, 'locationProposals', proposalId);
      await updateDoc(proposalRef, {
        status: 'approved',
        reviewedBy: currentUser?.uid || null,
        reviewedAt: new Date().toISOString()
      });

      // Optional: publish to a 'locations' collection (uncomment if you want this)
      // const proposal = proposals.find(p => p.id === proposalId);
      // if (proposal) {
      //   await addDoc(collection(db, 'locations'), {
      //     name: proposal.name,
      //     description: proposal.description || '',
      //     category: proposal.category || 'other',
      //     lat: proposal.latitude ?? proposal.lat ?? null,
      //     lng: proposal.longitude ?? proposal.lng ?? null,
      //     source: 'approved',
      //     createdAt: serverTimestamp(),
      //     approvedBy: currentUser?.uid || null
      //   });
      // }

      alert('Proposal approved successfully!');
      fetchProposals();
    } catch (error) {
      console.error('Error approving proposal:', error);
      alert('Failed to approve proposal');
    }
  };

  const handleReject = async (proposalId, reason) => {
    if (!isAdmin) {
      alert('Only admins can reject proposals.');
      return;
    }

    const rejectionReason = reason || prompt('Please provide a reason for rejection:');
    if (!rejectionReason) {
      alert('Rejection reason is required');
      return;
    }

    try {
      const proposalRef = doc(db, 'locationProposals', proposalId);
      await updateDoc(proposalRef, {
        status: 'rejected',
        reviewedBy: currentUser?.uid || null,
        reviewedAt: new Date().toISOString(),
        rejectionReason
      });

      alert('Proposal rejected successfully!');
      fetchProposals();
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      alert('Failed to reject proposal');
    }
  };

  const handleDelete = async (proposalId) => {
    if (!isAdmin) {
      alert('Only admins can delete proposals.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'locationProposals', proposalId));
      alert('Proposal deleted successfully!');
      fetchProposals();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      alert('Failed to delete proposal');
    }
  };

  // Start editing a proposal - opens the modal with current values
  const openEdit = (proposal) => {
    setEditing({
      id: proposal.id,
      name: proposal.name || '',
      description: proposal.description || '',
      category: proposal.category || '',
      latitude: proposal.latitude ?? proposal.lat ?? '',
      longitude: proposal.longitude ?? proposal.lng ?? '',
      imageUrl: proposal.imageUrl || ''
    });
  };

  // Cancel editing
  const closeEdit = () => {
    setEditing(null);
  };

  // Save edited proposal fields
  const saveEdit = async () => {
    if (!isAdmin) {
      alert('Only admins can edit proposals.');
      return;
    }
    if (!editing) return;
    setSaving(true);
    try {
      const proposalRef = doc(db, 'locationProposals', editing.id);
      // Prepare payload - convert lat/lng to numbers when possible
      const payload = {
        name: editing.name,
        description: editing.description,
        category: editing.category,
        imageUrl: editing.imageUrl,
        updatedAt: new Date().toISOString()
      };

      // Convert coords if they look numeric
      const latNum = parseFloat(editing.latitude);
      const lngNum = parseFloat(editing.longitude);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        payload.latitude = latNum;
        payload.longitude = lngNum;
      } else {
        // keep as-is if empty or invalid
        if (editing.latitude !== '') payload.latitude = editing.latitude;
        if (editing.longitude !== '') payload.longitude = editing.longitude;
      }

      await updateDoc(proposalRef, payload);
      alert('Proposal updated successfully!');
      setEditing(null);
      fetchProposals();
    } catch (error) {
      console.error('Error saving proposal edit:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-review-container">
        <div className="admin-review-header">
          <h1>Admin Review Panel</h1>
          <p>Only admins can access this page.</p>
        </div>
        <div style={{ padding: 20 }}>
          <p>If you believe you should have access, ensure your account is flagged as admin in Firestore or has the admin custom claim.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="admin-review-loading">Loading proposals...</div>;
  }

  return (
    <div className="admin-review-container">
      <div className="admin-review-header">
        <h1>Admin Review Panel</h1>
        <p>Review and manage location proposals</p>
      </div>

      <div className="filter-section">
        <label htmlFor="status-filter">Filter by Status:</label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="status-filter"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>

      {proposals.length === 0 ? (
        <div className="no-proposals">
          <p>No {filter !== 'all' ? filter : ''} proposals found.</p>
        </div>
      ) : (
        <div className="proposals-grid">
          {proposals.map((proposal) => (
            <div key={proposal.id} className={`proposal-card status-${proposal.status}`}>
              <div className="proposal-header">
                <h3>{proposal.name}</h3>
                <span className={`status-badge ${proposal.status}`}>
                  {proposal.status}
                </span>
              </div>

              <div className="proposal-details">
                <div className="detail-row">
                  <strong>Description:</strong>
                  <p>{proposal.description}</p>
                </div>

                <div className="detail-row">
                  <strong>Category:</strong>
                  <span className="category-tag">{proposal.category}</span>
                </div>

                <div className="detail-row">
                  <strong>Location:</strong>
                  <p>Lat: {proposal.latitude ?? proposal.lat}, Lng: {proposal.longitude ?? proposal.lng}</p>
                </div>

                <div className="detail-row">
                  <strong>Proposed by:</strong>
                  <p>{proposal.proposedBy || 'Anonymous'}</p>
                </div>

                <div className="detail-row">
                  <strong>Submitted:</strong>
                  <p>{proposal.createdAt ? new Date(proposal.createdAt).toLocaleString() : '—'}</p>
                </div>

                {proposal.imageUrl && (
                  <div className="detail-row">
                    <strong>Image:</strong>
                    <img
                      src={proposal.imageUrl}
                      alt={proposal.name}
                      className="proposal-image"
                      style={{ maxWidth: '100%', borderRadius: 8 }}
                    />
                  </div>
                )}

                {proposal.status === 'rejected' && proposal.rejectionReason && (
                  <div className="detail-row rejection-reason">
                    <strong>Rejection Reason:</strong>
                    <p>{proposal.rejectionReason}</p>
                  </div>
                )}

                {proposal.reviewedBy && (
                  <div className="detail-row">
                    <strong>Reviewed by:</strong>
                    <p>{proposal.reviewedBy}</p>
                    <p className="review-date">
                      {proposal.reviewedAt ? new Date(proposal.reviewedAt).toLocaleString() : '—'}
                    </p>
                  </div>
                )}
              </div>

              <div className="proposal-actions">
                {proposal.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(proposal.id)}
                      className="btn btn-approve"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(proposal.id)}
                      className="btn btn-reject"
                    >
                      Reject
                    </button>
                  </>
                )}

                <button
                  onClick={() => openEdit(proposal)}
                  className="btn btn-edit"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(proposal.id)}
                  className="btn btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal (simple) */}
      {editing && (
        <div className="edit-modal-backdrop" style={backdropStyle}>
          <div className="edit-modal" style={modalStyle}>
            <h3>Edit Proposal</h3>
            <label style={labelStyle}>Name
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </label>
            <label style={labelStyle}>Description
              <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={4} />
            </label>
            <label style={labelStyle}>Category
              <input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <label style={{ ...labelStyle, flex: 1 }}>Latitude
                <input value={editing.latitude} onChange={(e) => setEditing({ ...editing, latitude: e.target.value })} />
              </label>
              <label style={{ ...labelStyle, flex: 1 }}>Longitude
                <input value={editing.longitude} onChange={(e) => setEditing({ ...editing, longitude: e.target.value })} />
              </label>
            </div>
            <label style={labelStyle}>Image URL
              <input value={editing.imageUrl} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} />
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={closeEdit} className="btn">Cancel</button>
              <button onClick={saveEdit} className="btn btn-approve" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Inline styles for the modal - you can move to CSS file if you prefer */
const backdropStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
};
const modalStyle = {
  width: 'min(760px, 95%)',
  background: '#fff',
  padding: 20,
  borderRadius: 12,
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
};
const labelStyle = {
  display: 'block',
  marginBottom: 8,
  fontSize: 14
};

export default AdminReview;
