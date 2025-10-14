import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import './AdminReview.css';

const AdminReview = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchProposals();
  }, [filter]);

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
      const proposalsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProposals(proposalsData);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      alert('Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (proposalId) => {
    try {
      const proposalRef = doc(db, 'locationProposals', proposalId);
      await updateDoc(proposalRef, {
        status: 'approved',
        reviewedBy: currentUser.uid,
        reviewedAt: new Date().toISOString()
      });
      
      alert('Proposal approved successfully!');
      fetchProposals();
    } catch (error) {
      console.error('Error approving proposal:', error);
      alert('Failed to approve proposal');
    }
  };

  const handleReject = async (proposalId, reason) => {
    const rejectionReason = reason || prompt('Please provide a reason for rejection:');
    
    if (!rejectionReason) {
      alert('Rejection reason is required');
      return;
    }

    try {
      const proposalRef = doc(db, 'locationProposals', proposalId);
      await updateDoc(proposalRef, {
        status: 'rejected',
        reviewedBy: currentUser.uid,
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
                  <p>Lat: {proposal.latitude}, Lng: {proposal.longitude}</p>
                </div>

                <div className="detail-row">
                  <strong>Proposed by:</strong>
                  <p>{proposal.proposedBy || 'Anonymous'}</p>
                </div>

                <div className="detail-row">
                  <strong>Submitted:</strong>
                  <p>{new Date(proposal.createdAt).toLocaleString()}</p>
                </div>

                {proposal.imageUrl && (
                  <div className="detail-row">
                    <strong>Image:</strong>
                    <img 
                      src={proposal.imageUrl} 
                      alt={proposal.name}
                      className="proposal-image"
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
                      {new Date(proposal.reviewedAt).toLocaleString()}
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
    </div>
  );
};

export default AdminReview;
