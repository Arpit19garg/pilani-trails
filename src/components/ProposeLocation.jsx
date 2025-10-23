import { useState, useContext } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../AuthContext';
import './ProposeLocation.css';

const ProposeLocation = () => {
  const { currentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setMessage({ type: 'error', text: 'You must be logged in to propose a location.' });
      return;
    }

    if (!formData.name || !formData.description || !formData.latitude || !formData.longitude || !formData.category) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setMessage({ type: 'error', text: 'Please enter valid coordinates.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // ✅ Add to the same collection your AdminReview reads
      await addDoc(collection(db, 'locationProposals'), {
        name: formData.name,
        description: formData.description,
        latitude: lat,
        longitude: lng,
        category: formData.category,
        status: 'pending',
        proposedBy: currentUser.displayName || currentUser.email,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: serverTimestamp(),
      });

      setMessage({ type: 'success', text: 'Location proposal submitted successfully!' });
      setFormData({
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        category: '',
      });
    } catch (error) {
      console.error('Error submitting proposal:', error);
      setMessage({ type: 'error', text: 'Failed to submit proposal. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="propose-location-container">
        <div className="login-required">
          <h2>Login Required</h2>
          <p>You must be logged in to propose a new location.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="propose-location-container">
      <div className="propose-location-card">
        <h2>Propose a New Location</h2>
        <p className="subtitle">Share a new trail or location with the community</p>

        {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Location Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter location name"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the location"
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude *</label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g., 28.3636"
                required
              />
            </div>
            <div className="form-group">
              <label>Longitude *</label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g., 75.5868"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="trail">Trail</option>
              <option value="viewpoint">Viewpoint</option>
              <option value="landmark">Landmark</option>
              <option value="park">Park</option>
              <option value="food">Food</option>
              <option value="stationery">Stationery</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Proposal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProposeLocation;
