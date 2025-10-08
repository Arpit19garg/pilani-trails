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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!currentUser) {
      setMessage({ type: 'error', text: 'You must be logged in to propose a location.' });
      return;
    }

    // Validate form data
    if (!formData.name || !formData.description || !formData.latitude || !formData.longitude || !formData.category) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    // Validate coordinates
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setMessage({ type: 'error', text: 'Please enter valid coordinates.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Add proposal to Firestore with 'pending' status
      await addDoc(collection(db, 'proposals'), {
        name: formData.name,
        description: formData.description,
        latitude: lat,
        longitude: lng,
        category: formData.category,
        status: 'pending',
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: serverTimestamp(),
      });

      setMessage({ type: 'success', text: 'Location proposal submitted successfully!' });
      // Reset form
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

  // Redirect message if not logged in
  if (!currentUser) {
    return (
      <div className="propose-location-container">
        <div className="login-required">
          <h2>Login Required</h2>
          <p>You must be logged in to propose a new location.</p>
          <p>Please log in or sign up to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="propose-location-container">
      <div className="propose-location-card">
        <h2>Propose a New Location</h2>
        <p className="subtitle">Share a new trail or location with the community</p>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Location Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter location name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the location, its features, and why it should be added"
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitude *</label>
              <input
                type="text"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g., 28.3636"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude *</label>
              <input
                type="text"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g., 75.5868"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
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
