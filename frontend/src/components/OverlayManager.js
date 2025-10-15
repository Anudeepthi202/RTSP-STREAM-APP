import React, { useState, useEffect } from 'react';
import { overlayAPI } from '../services/api';
import './OverlayManager.css';

const OverlayManager = ({ onOverlaysUpdate }) => {
  const [overlays, setOverlays] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOverlay, setEditingOverlay] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'text',
    content: '',
    position: { x: 10, y: 10 },
    size: { width: 100, height: 40 }
  });

  // Load overlays on component mount
  useEffect(() => {
    loadOverlays();
  }, []);

  const loadOverlays = async () => {
    try {
      const response = await overlayAPI.getAll();
      setOverlays(response.data);
      onOverlaysUpdate(response.data);
    } catch (error) {
      console.error('Error loading overlays:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // FIXED: Handle number inputs properly
    if (name.startsWith('position.')) {
      const field = name.split('.')[1];
      const numValue = parseInt(value) || 0; // Default to 0 if NaN
      setFormData(prev => ({
        ...prev,
        position: { ...prev.position, [field]: numValue }
      }));
    } else if (name.startsWith('size.')) {
      const field = name.split('.')[1];
      const numValue = parseInt(value) || 50; // Default to 50 if NaN
      setFormData(prev => ({
        ...prev,
        size: { ...prev.size, [field]: numValue }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOverlay) {
        await overlayAPI.update(editingOverlay.id, formData);
      } else {
        await overlayAPI.create(formData);
      }
      await loadOverlays();
      resetForm();
      alert(`Overlay ${editingOverlay ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving overlay:', error);
      alert('Failed to save overlay');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'text',
      content: '',
      position: { x: 10, y: 10 },
      size: { width: 100, height: 40 }
    });
    setEditingOverlay(null);
    setShowForm(false);
  };

  const editOverlay = (overlay) => {
    setFormData({
      name: overlay.name,
      type: overlay.type,
      content: overlay.content,
      position: overlay.position,
      size: overlay.size
    });
    setEditingOverlay(overlay);
    setShowForm(true);
  };

  const deleteOverlay = async (id) => {
    if (window.confirm('Are you sure you want to delete this overlay?')) {
      try {
        await overlayAPI.delete(id);
        await loadOverlays();
        alert('Overlay deleted successfully!');
      } catch (error) {
        console.error('Error deleting overlay:', error);
        alert('Failed to delete overlay');
      }
    }
  };

  return (
    <div className="overlay-manager">
      <div className="overlay-header">
        <h3>Overlay Manager</h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? '📋 Hide Form' : '➕ Add Overlay'}
        </button>
      </div>

      {showForm && (
        <div className="overlay-form-container">
          <h4>{editingOverlay ? 'Edit Overlay' : 'Create New Overlay'}</h4>
          <form onSubmit={handleSubmit} className="overlay-form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter overlay name"
              />
            </div>

            <div className="form-group">
              <label>Type:</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
              </select>
            </div>

            <div className="form-group">
              <label>Content:</label>
              {formData.type === 'text' ? (
                <input
                  type="text"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter text content"
                />
              ) : (
                <input
                  type="url"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter image URL"
                />
              )}
            </div>

            <div className="position-size-group">
              <div className="form-group">
                <label>Position X (%):</label>
                <input
                  type="number"
                  name="position.x"
                  value={formData.position.x || 0}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label>Position Y (%):</label>
                <input
                  type="number"
                  name="position.y"
                  value={formData.position.y || 0}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label>Width (px):</label>
                <input
                  type="number"
                  name="size.width"
                  value={formData.size.width || 50}
                  onChange={handleInputChange}
                  min="10"
                  max="500"
                />
              </div>

              <div className="form-group">
                <label>Height (px):</label>
                <input
                  type="number"
                  name="size.height"
                  value={formData.size.height || 50}
                  onChange={handleInputChange}
                  min="10"
                  max="500"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingOverlay ? '💾 Update Overlay' : '➕ Create Overlay'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="saved-overlays">
        <h4>Saved Overlays ({overlays.length})</h4>
        {overlays.length === 0 ? (
          <p className="no-overlays">No overlays created yet</p>
        ) : (
          <div className="overlays-list">
            {overlays.map(overlay => (
              <div key={overlay.id} className="overlay-item">
                <div className="overlay-info">
                  <strong>{overlay.name}</strong>
                  <span className="overlay-type">({overlay.type})</span>
                  <span className="overlay-position">
                    Position: {overlay.position.x}%, {overlay.position.y}%
                  </span>
                </div>
                <div className="overlay-actions">
                  <button 
                    onClick={() => editOverlay(overlay)}
                    className="btn btn-small"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => deleteOverlay(overlay.id)}
                    className="btn btn-small btn-danger"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverlayManager;