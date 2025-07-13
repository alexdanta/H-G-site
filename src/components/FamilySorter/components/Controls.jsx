import React, { useState } from 'react';
import styles from '../FamilySorter.module.css';

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
    <div className={styles.controls}>
      <div className={styles.viewSelector}>
        <button 
          className={`${styles.viewBtn} ${currentView === 'items' ? styles.active : ''}`}
          onClick={() => onViewChange('items')}
        >
          📷 Items View
        </button>
        <button 
          className={`${styles.viewBtn} ${currentView === 'dashboard' ? styles.active : ''}`}
          onClick={() => onViewChange('dashboard')}
        >
          📊 Analytics View
        </button>
      </div>

      {currentUser?.isAdmin && (
        <div className={styles.addItemSection}>
          <div className={styles.mobilePhotoOptions}>
            <div className={styles.fileInputWrapper}>
              <input 
                type="file" 
                id="photoInput" 
                accept="image/*"
                capture="environment"
                multiple
                onChange={(e) => handlePhotoAdd(e.target.files)}
              />
              <label htmlFor="photoInput" className={`${styles.fileInputLabel} ${styles.cameraBtn}`}>
                📸 Take Photos
              </label>
            </div>
            
            <div className={styles.fileInputWrapper}>
              <input 
                type="file" 
                id="galleryInput" 
                accept="image/*"
                multiple
                onChange={(e) => handlePhotoAdd(e.target.files)}
              />
              <label htmlFor="galleryInput" className={`${styles.fileInputLabel} ${styles.galleryBtn}`}>
                🖼️ Choose from Gallery
              </label>
            </div>
          </div>
          
          {photoFiles.length > 0 && (
            <div className={styles.photosPreview}>
              <div className={styles.previewHeader}>
                <span className={styles.photoCount}>{photoFiles.length} photo{photoFiles.length !== 1 ? 's' : ''} selected</span>
                <button 
                  type="button" 
                  className={styles.clearAllBtn}
                  onClick={() => setPhotoFiles([])}
                >
                  Clear All
                </button>
              </div>
              <div className={styles.photosGrid}>
                {photoFiles.map((file, index) => (
                  <div key={index} className={styles.photoItem}>
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Preview ${index + 1}`} 
                      className={styles.previewImage}
                    />
                    <button 
                      type="button"
                      className={styles.removePhotoBtn}
                      onClick={() => removePhoto(index)}
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
          
          <input 
            type="text" 
            className={styles.descriptionInput}
            placeholder="Item description (e.g., 'Mom's blue ceramic vase from Italy')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className={styles.addBtn}
            onClick={handleAddItem}
            disabled={isAdding}
          >
            {isAdding ? 'Processing...' : `Add Item${photoFiles.length > 1 ? ` (${photoFiles.length} photos)` : ''}`}
          </button>
        </div>
      )}

      {currentView === 'dashboard' && (
        <div className={styles.sortOptions}>
          <button 
            className={`${styles.sortBtn} ${currentSort === 'votes' ? styles.active : ''}`}
            onClick={() => onSortChange('votes')}
          >
            Most Voted First
          </button>
          <button 
            className={`${styles.sortBtn} ${currentSort === 'recent' ? styles.active : ''}`}
            onClick={() => onSortChange('recent')}
          >
            Most Recent First
          </button>
          <button 
            className={`${styles.sortBtn} ${currentSort === 'conflicts' ? styles.active : ''}`}
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