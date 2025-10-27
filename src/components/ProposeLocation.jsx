import { useState, useContext } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../AuthContext";
import LocationPickerMap from "../components/LocationPickerMap";
import "./ProposeLocation.css";

const ProposeLocation = () => {
  const { currentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
    imageUrl: "",
    location: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser)
      return setMessage({
        type: "error",
        text: "You must be logged in to propose a location.",
      });

    if (!formData.name || !formData.description || !formData.category)
      return setMessage({
        type: "error",
        text: "Please provide name, description, and category.",
      });

    if (!formData.location)
      return setMessage({
        type: "error",
        text: "Please drop a pin on the map to select location.",
      });

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await addDoc(collection(db, "locationProposals"), {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        tags: formData.tags || "",
        imageUrl: formData.imageUrl || "",
        location: {
          lat: formData.location.lat,
          lng: formData.location.lng,
        },
        status: "pending",
        proposedBy: currentUser.email || currentUser.uid,
        userId: currentUser.uid,
        userEmail: currentUser.email || "",
        createdAt: serverTimestamp(),
      });

      setMessage({
        type: "success",
        text: "✅ Location proposal submitted successfully! Awaiting admin review.",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        tags: "",
        imageUrl: "",
        location: null,
      });
    } catch (err) {
      console.error("Error submitting proposal:", err);
      setMessage({
        type: "error",
        text: `❌ Failed to submit proposal: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="propose-location-container">
      <div className="propose-location-card">
        <h2>Propose a New Location</h2>
        <p className="subtitle">Share a new trail or point of interest with the community</p>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Location Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter location name"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the location briefly"
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
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

          <div className="form-group">
            <label>Pin Location *</label>
            <LocationPickerMap
              value={formData.location}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, location: val }))
              }
            />
          </div>

          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. hiking, sunset, peaceful"
            />
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Submitting..." : "Submit Proposal"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProposeLocation;
