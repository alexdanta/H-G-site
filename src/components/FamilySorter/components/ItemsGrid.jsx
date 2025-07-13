import React, { useState } from 'react';
import styles from '../FamilySorter.module.css';

const ItemsGrid = ({ items = [], currentUser, onVote, onDelete }) => {
  // Track current image index for each item
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});

  const generateVoteSummary = (item) => {
    const votes = item.votes || {};
    const voteCounts = {
      keep: 0,
      charity: 0,
      sell: 0,
      trash: 0
    };

    Object.values(votes).forEach(vote => {
      if (voteCounts[vote] !== undefined) {
        voteCounts[vote]++;
      }
    });

    let summary = '';
    Object.entries(voteCounts).forEach(([choice, count]) => {
      if (count > 0) {
        const emoji = {
          keep: '💚',
          charity: '🤝',
          sell: '💰',
          trash: '🗑️'
        }[choice];
        summary += `<div class="${styles.voteCount}"><span>${emoji} ${choice.charAt(0).toUpperCase() + choice.slice(1)}</span><span>${count}</span></div>`;
      }
    });

    return summary || '<div style="color: #6c757d;">No votes yet</div>';
  };

  const handleImageClick = (itemId, images) => {
    if (images.length <= 1) return; // No cycling needed for single images
    
    setCurrentImageIndexes(prev => {
      const currentIndex = prev[itemId] || 0;
      const nextIndex = (currentIndex + 1) % images.length;
      return { ...prev, [itemId]: nextIndex };
    });
  };

  const handleThumbnailClick = (itemId, targetIndex) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [itemId]: targetIndex
    }));
  };

  const renderItemImages = (item) => {
    // Handle both old single image format and new multiple images format
    const images = item.images || (item.image ? [item.image] : []);
    const currentIndex = currentImageIndexes[item.id] || 0;
    const currentImage = images[currentIndex] || item.primaryImage || item.image || images[0];

    if (images.length === 0) {
      return (
        <div className={`${styles.itemImage} ${styles.noImage}`}>
          📷 No Image
        </div>
      );
    }

    if (images.length === 1) {
      return (
        <img 
          src={currentImage} 
          alt={item.description} 
          className={styles.itemImage}
        />
      );
    }

    return (
      <div className={styles.itemImagesContainer}>
        <img 
          src={currentImage} 
          alt={`${item.description} ${currentIndex + 1}`}
          className={`${styles.itemImage} ${styles.primary}`}
          onClick={() => handleImageClick(item.id, images)}
          style={{ cursor: 'pointer' }}
          title="Click to cycle through images"
        />
        
        {/* Image counter badge */}
        <div className={styles.imageCountBadge}>
          {currentIndex + 1}/{images.length}
        </div>
        
        {/* Thumbnail navigation */}
        <div className={styles.imageThumbnails}>
          {images.slice(0, 4).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${item.description} ${index + 1}`}
              className={`${styles.thumbnail} ${index === currentIndex ? styles.activeThumbnail : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleThumbnailClick(item.id, index);
              }}
              style={{ 
                cursor: 'pointer',
                opacity: index === currentIndex ? 1 : 0.7,
                border: index === currentIndex ? '2px solid #007bff' : '2px solid white'
              }}
              title={`View image ${index + 1}`}
            />
          ))}
          
          {/* Show "+X more" if there are more than 4 images */}
          {images.length > 4 && (
            <div 
              className={styles.thumbnail}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: 'rgba(0,0,0,0.7)', 
                color: 'white', 
                fontSize: '0.7rem',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Cycle to the next image beyond the visible thumbnails
                const nextIndex = currentIndex >= 3 ? 0 : currentIndex + 1;
                handleThumbnailClick(item.id, nextIndex);
              }}
              title="More images"
            >
              +{images.length - 4}
            </div>
          )}
        </div>
        
        {/* Navigation arrows for easier cycling */}
        {images.length > 1 && (
          <>
            <button
              className={`${styles.navBtn} ${styles.prev}`}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: '0.8',
                transition: 'opacity 0.3s ease'
              }}
              onClick={(e) => {
                e.stopPropagation();
                const prevIndex = (currentIndex - 1 + images.length) % images.length;
                handleThumbnailClick(item.id, prevIndex);
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
              title="Previous image"
            >
              ‹
            </button>
            
            <button
              className={`${styles.navBtn} ${styles.next}`}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: '0.8',
                transition: 'opacity 0.3s ease'
              }}
              onClick={(e) => {
                e.stopPropagation();
                const nextIndex = (currentIndex + 1) % images.length;
                handleThumbnailClick(item.id, nextIndex);
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
              title="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={styles.itemsGrid}>
      {items.map(item => (
        <div key={item.id} className={styles.itemCard}>
          {currentUser?.isAdmin && (
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(item.id)}
              title="Delete item"
            >
              ×
            </button>
          )}
          
          {renderItemImages(item)}
          
          <div className={styles.itemInfo}>
            <div className={styles.itemDescription}>{item.description}</div>
            
            {/* Only show voting section if user is an active voter */}
            {currentUser?.id !== 'laura' && (
              <div className={styles.votingSection}>
                <div className={styles.voteButtons}>
                  <button 
                    className={`${styles.voteBtn} ${styles.keep} ${(item.votes && item.votes[currentUser?.id]) === 'keep' ? styles.voted : ''}`}
                    onClick={() => onVote(item.id, 'keep')}
                  >
                    💚 Keep
                  </button>
                  <button 
                    className={`${styles.voteBtn} ${styles.charity} ${(item.votes && item.votes[currentUser?.id]) === 'charity' ? styles.voted : ''}`}
                    onClick={() => onVote(item.id, 'charity')}
                  >
                    🤝 Charity
                  </button>
                  <button 
                    className={`${styles.voteBtn} ${styles.sell} ${(item.votes && item.votes[currentUser?.id]) === 'sell' ? styles.voted : ''}`}
                    onClick={() => onVote(item.id, 'sell')}
                  >
                    💰 Sell
                  </button>
                  <button 
                    className={`${styles.voteBtn} ${styles.trash} ${(item.votes && item.votes[currentUser?.id]) === 'trash' ? styles.voted : ''}`}
                    onClick={() => onVote(item.id, 'trash')}
                  >
                    🗑️ Trash
                  </button>
                </div>
                
                <div 
                  className={styles.voteSummary}
                  dangerouslySetInnerHTML={{ __html: generateVoteSummary(item) }}
                />
              </div>
            )}
            
            {/* Show view-only message for Laura */}
            {currentUser?.id === 'laura' && (
              <div className={styles.votingSection}>
                <div 
                  className={styles.voteSummary}
                  dangerouslySetInnerHTML={{ __html: generateVoteSummary(item) }}
                />
                <div style={{ 
                  textAlign: 'center', 
                  color: '#6c757d', 
                  fontStyle: 'italic',
                  marginTop: '10px',
                  padding: '10px',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  👀 You have View-only access
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {items.length === 0 && (
        <div style={{ 
          gridColumn: '1 / -1', 
          textAlign: 'center', 
          color: '#6c757d', 
          padding: '40px',
          fontSize: '1.1rem'
        }}>
          No items added yet. {currentUser?.isAdmin ? 'Add some items above to get started!' : 'Wait for Alexander to add items.'}
        </div>
      )}
    </div>
  );
};

export default ItemsGrid;