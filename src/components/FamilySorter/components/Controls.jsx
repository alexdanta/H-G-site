import React, { useState } from 'react';

const Controls = ({ currentUser, currentView, currentSort, items = [], onViewChange, onSortChange, onAddItem }) => {
  const [photoFiles, setPhotoFiles] = useState([]);
  const [description, setDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddItem = async () => {
    if (photoFiles.length === 0 || !description.trim()) {
      alert('Please add at least one photo and description!');
      return;
    }

    setIsAdding(true);
    const success = await onAddItem(photoFiles, description);
    
    if (success) {
      setPhotoFiles([]);
      setDescription('');
      // Reset file inputs
      const fileInputs = document.querySelectorAll('#photoInput, #galleryInput');
      fileInputs.forEach(input => input.value = '');
    }
    
    setIsAdding(false);
  };

  const handlePhotoAdd = (newFiles) => {
    const filesArray = Array.from(newFiles);
    setPhotoFiles(prev => [...prev, ...filesArray]);
  };

  const removePhoto = (index) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div className="controls">
      <div className="view-selector">
        <button 
          className={`view-btn ${currentView === 'items' ? 'active' : ''}`}
          onClick={() => onViewChange('items')}
        >
          📷 Items View
        </button>
        <button 
          className={`view-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('dashboard')}
        >
          📊 Dashboard
        </button>
      </div>

      {currentUser?.isAdmin && (
        <div className="add-item-section">
          <div className="mobile-photo-options">
            <div className="file-input-wrapper">
              <input 
                type="file" 
                id="photoInput" 
                accept="image/*"
                capture="environment"
                multiple
                onChange={(e) => handlePhotoAdd(e.target.files)}
              />
              <label htmlFor="photoInput" className="file-input-label camera-btn">
                📸 Take Photos
              </label>
            </div>
            
            <div className="file-input-wrapper">
              <input 
                type="file" 
                id="galleryInput" 
                accept="image/*"
                multiple
                onChange={(e) => handlePhotoAdd(e.target.files)}
              />
              <label htmlFor="galleryInput" className="file-input-label gallery-btn">
                🖼️ Choose from Gallery
              </label>
            </div>
          </div>
          
          {photoFiles.length > 0 && (
            <div className="photos-preview">
              <div className="preview-header">
                <span className="photo-count">{photoFiles.length} photo{photoFiles.length !== 1 ? 's' : ''} selected</span>
                <button 
                  type="button" 
                  className="clear-all-btn"
                  onClick={() => setPhotoFiles([])}
                >
                  Clear All
                </button>
              </div>
              <div className="photos-grid">
                {photoFiles.map((file, index) => (
                  <div key={index} className="photo-item">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Preview ${index + 1}`} 
                      className="preview-image"
                    />
                    <button 
                      type="button"
                      className="remove-photo-btn"
                      onClick={() => removePhoto(index)}
                      title="Remove photo"
                    >
                      ×
                    </button>
                    <div className="photo-number">{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <input 
            type="text" 
            className="description-input"
            placeholder="Item description (e.g., 'Mom's blue ceramic vase from Italy')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="add-btn"
            onClick={handleAddItem}
            disabled={isAdding}
          >
            {isAdding ? 'Processing...' : `Add Item${photoFiles.length > 1 ? ` (${photoFiles.length} photos)` : ''}`}
          </button>
        </div>
      )}

      {currentView === 'dashboard' && (
        <div className="sort-options">
          <button 
            className={`sort-btn ${currentSort === 'votes' ? 'active' : ''}`}
            onClick={() => onSortChange('votes')}
          >
            Most Voted First
          </button>
          <button 
            className={`sort-btn ${currentSort === 'recent' ? 'active' : ''}`}
            onClick={() => onSortChange('recent')}
          >
            Most Recent First
          </button>
          <button 
            className={`sort-btn ${currentSort === 'conflicts' ? 'active' : ''}`}
            onClick={() => onSortChange('conflicts')}
          >
            Conflicts First
          </button>
        </div>
      )}
    </div>
  );
};

export default Controls;