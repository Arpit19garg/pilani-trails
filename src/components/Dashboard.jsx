import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import '../App.css'

export default function Dashboard() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [userProposals, setUserProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProposals: 0,
    pendingProposals: 0,
    approvedProposals: 0,
    rejectedProposals: 0
  })

  useEffect(() => {
    loadUserData()
  }, [currentUser])

  const loadUserData = async () => {
    setLoading(true)
    try {
      // In a real app, fetch from Firebase/backend
      // For now, load from localStorage
      const proposals = JSON.parse(localStorage.getItem('proposals') || '[]')
      const userProps = proposals.filter(p => p.userId === currentUser?.uid)
      
      setUserProposals(userProps)
      setStats({
        totalProposals: userProps.length,
        pendingProposals: userProps.filter(p => p.status === 'pending').length,
        approvedProposals: userProps.filter(p => p.status === 'approved').length,
        rejectedProposals: userProps.filter(p => p.status === 'rejected').length
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return '#28a745'
      case 'rejected': return '#dc3545'
      case 'pending': return '#ffc107'
      default: return '#6c757d'
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container" style={styles.container}>
        <div style={styles.loading}>Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <div className="dashboard-container" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Dashboard</h1>
        <p style={styles.subtitle}>Welcome back, {currentUser?.email || 'User'}!</p>
      </div>

      {/* User Info Card */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Account Information</h2>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <strong>Email:</strong> {currentUser?.email}
          </div>
          <div style={styles.infoItem}>
            <strong>User ID:</strong> {currentUser?.uid}
          </div>
          <div style={styles.infoItem}>
            <strong>Member Since:</strong> {new Date(currentUser?.metadata?.creationTime || Date.now()).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderLeftColor: '#007bff'}}>
          <div style={styles.statNumber}>{stats.totalProposals}</div>
          <div style={styles.statLabel}>Total Proposals</div>
        </div>
        <div style={{...styles.statCard, borderLeftColor: '#ffc107'}}>
          <div style={styles.statNumber}>{stats.pendingProposals}</div>
          <div style={styles.statLabel}>Pending Review</div>
        </div>
        <div style={{...styles.statCard, borderLeftColor: '#28a745'}}>
          <div style={styles.statNumber}>{stats.approvedProposals}</div>
          <div style={styles.statLabel}>Approved</div>
        </div>
        <div style={{...styles.statCard, borderLeftColor: '#dc3545'}}>
          <div style={styles.statNumber}>{stats.rejectedProposals}</div>
          <div style={styles.statLabel}>Rejected</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <Link to="/propose" style={styles.actionButton}>
            <span style={styles.actionIcon}>➕</span>
            <span>Propose New Location</span>
          </Link>
          <Link to="/" style={styles.actionButton}>
            <span style={styles.actionIcon}>🗺️</span>
            <span>View Map</span>
          </Link>
          <Link to="/contribute" style={styles.actionButton}>
            <span style={styles.actionIcon}>✍️</span>
            <span>Contribute</span>
          </Link>
          <button onClick={handleLogout} style={{...styles.actionButton, cursor: 'pointer', border: 'none'}}>
            <span style={styles.actionIcon}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Proposals List */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>My Proposals</h2>
        {userProposals.length === 0 ? (
          <div style={styles.emptyState}>
            <p>You haven't submitted any proposals yet.</p>
            <Link to="/propose" style={styles.primaryButton}>
              Submit Your First Proposal
            </Link>
          </div>
        ) : (
          <div style={styles.proposalsList}>
            {userProposals.map((proposal) => (
              <div key={proposal.id} style={styles.proposalCard}>
                <div style={styles.proposalHeader}>
                  <h3 style={styles.proposalTitle}>{proposal.name}</h3>
                  <span 
                    style={{
                      ...styles.statusBadge, 
                      backgroundColor: getStatusColor(proposal.status)
                    }}
                  >
                    {proposal.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                <div style={styles.proposalDetails}>
                  <div><strong>Category:</strong> {proposal.category}</div>
                  <div><strong>Location:</strong> [{proposal.lat?.toFixed(4)}, {proposal.lng?.toFixed(4)}]</div>
                  <div><strong>Submitted:</strong> {new Date(proposal.timestamp).toLocaleDateString()}</div>
                </div>
                {proposal.description && (
                  <p style={styles.proposalDescription}>{proposal.description}</p>
                )}
                {proposal.adminFeedback && (
                  <div style={styles.feedback}>
                    <strong>Admin Feedback:</strong> {proposal.adminFeedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Need Help?</h2>
        <p>Check out our <Link to="/about" style={styles.link}>About page</Link> for more information about Pilani Trails.</p>
        <p>Questions? Contact us or visit the <Link to="/contribute" style={styles.link}>Contribute page</Link> to learn more.</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#333',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#333',
  },
  infoGrid: {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  },
  infoItem: {
    padding: '0.5rem',
    fontSize: '1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: '4px solid',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  actionButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#333',
    transition: 'all 0.2s',
    fontWeight: '500',
  },
  actionIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
  },
  primaryButton: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    marginTop: '1rem',
    fontWeight: '500',
  },
  proposalsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  proposalCard: {
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  proposalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  proposalTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: 0,
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  proposalDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    color: '#666',
  },
  proposalDescription: {
    marginTop: '0.5rem',
    color: '#555',
    lineHeight: '1.5',
  },
  feedback: {
    marginTop: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#fff',
    borderRadius: '4px',
    borderLeft: '3px solid #007bff',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: '500',
  },
}
