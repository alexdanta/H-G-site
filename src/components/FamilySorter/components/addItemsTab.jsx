import React, { useState } from 'react';
import styles from '../FamilySorter.module.css';

const AddItemsTab = ({ currentUser, onAddItem }) => {
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [description, setDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handlePhotoSelection = (files) => {
    if (files) {
      const newPhotos = Array.from(files).slice(0, 10); // Limit to 10 photos
      setSelectedPhotos(prev => [...prev, ...newPhotos].slice(0, 10));
    }
  };

  const removePhoto = (index) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllPhotos = () => {
    setSelectedPhotos([]);
  };

  const handleAddItem = async () => {
    if (!selectedPhotos.length || !description.trim()) {
      alert('Please add at least one photo and a description.');
      return;
    }

    setIsAdding(true);
    try {
      const success = await onAddItem(selectedPhotos, description);
      if (success) {
        setSelectedPhotos([]);
        setDescription('');
      }
    } finally {
      setIsAdding(false);
    }
  };

  if (!currentUser?.isAdmin) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#6c757d'
      }}>
        <h3>🔒 Admin Access Required</h3>
        <p>Only Alexander can add items to the family sorter.</p>
      </div>
    );
  }

  return (
    <div className={styles.addItemsTab}>
      <div className={styles.addItemSection}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>📷 Add New Item</h3>
        
        {/* Photo Selection */}
        <div className={styles.mobilePhotoOptions}>
          <div className={styles.fileInputWrapper}>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => handlePhotoSelection(e.target.files)}
              id="camera-input"
            />
            <label htmlFor="camera-input" className={`${styles.fileInputLabel} ${styles.cameraBtn}`}>
              📸 Take Photos
            </label>
          </div>
          
          <div className={styles.fileInputWrapper}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handlePhotoSelection(e.target.files)}
              id="gallery-input"
            />
            <label htmlFor="gallery-input" className={`${styles.fileInputLabel} ${styles.galleryBtn}`}>
              🖼️ Choose from Gallery
            </label>
          </div>
        </div>

        {/* Photos Preview */}
        {selectedPhotos.length > 0 && (
          <div className={styles.photosPreview}>
            <div className={styles.previewHeader}>
              <span className={styles.photoCount}>
                {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''} selected
              </span>
              <button 
                onClick={clearAllPhotos}
                className={styles.clearAllBtn}
              >
                Clear All
              </button>
            </div>
            
            <div className={styles.photosGrid}>
              {selectedPhotos.map((photo, index) => (
                <div key={index} className={styles.photoItem}>
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Preview ${index + 1}`}
                    className={styles.previewImage}
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className={styles.removePhotoBtn}
                    title="Remove photo"
                  >
                    ×
                  </button>
                  <div className={styles.photoNumber}>{index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description Input */}
        <input
          type="text"
          placeholder="Describe this item (e.g., 'Blue ceramic vase from living room')"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.descriptionInput}
          maxLength={100}
        />

        {/* Add Button */}
        <button
          onClick={handleAddItem}
          disabled={!selectedPhotos.length || !description.trim() || isAdding}
          className={styles.addBtn}
        >
          {isAdding ? '📤 Adding Item...' : '➕ Add Item to Family Sorter'}
        </button>
      </div>

      {/* Tips Section */}
      <div className={styles.tipsSection}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>💡 Photo Tips</h3>
        
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h4>📸 Great Photos</h4>
            <ul>
              <li>Good lighting (natural light works best)</li>
              <li>Multiple angles of the item</li>
              <li>Show any damage or wear</li>
              <li>Include size reference if helpful</li>
            </ul>
          </div>
          
          <div className={styles.tipCard}>
            <h4>📝 Descriptions</h4>
            <ul>
              <li>Include the room/location</li>
              <li>Mention material (ceramic, wood, etc.)</li>
              <li>Add any sentimental value</li>
              <li>Keep it under 100 characters</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemsTab;
