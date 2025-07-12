import React, { useState } from 'react';

const ItemsGrid = ({ items = [], currentUser, onVote, onDelete }) => {
  const [expandedImage, setExpandedImage] = useState(null);

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
        summary += `<div class="vote-count"><span>${emoji} ${choice.charAt(0).toUpperCase() + choice.slice(1)}</span><span>${count}</span></div>`;
      }
    });

    return summary || '<div style="color: #6c757d;">No votes yet</div>';
  };

  const renderItemImages = (item) => {
    // Handle both old single image format and new multiple images format
    const images = item.images || (item.image ? [item.image] : []);
    const primaryImage = item.primaryImage || item.image || images[0];

    if (images.length === 0) {
      return (
        <div className="item-image no-image">
          📷 No Image
        </div>
      );
    }

    if (images.length === 1) {
      return (
        <img 
          src={primaryImage} 
          alt={item.description} 
          className="item-image"
          onClick={() => setExpandedImage({ images, currentIndex: 0, description: item.description })}
        />
      );
    }

    return (
      <div className="item-images-container">
        <img 
          src={primaryImage} 
          alt={item.description} 
          className="item-image primary"
          onClick={() => setExpandedImage({ images, currentIndex: 0, description: item.description })}
        />
        <div className="image-count-badge">
          +{images.length - 1}
        </div>
        <div className="image-thumbnails">
          {images.slice(1, 4).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${item.description} ${index + 2}`}
              className="thumbnail"
              onClick={() => setExpandedImage({ images, currentIndex: index + 1, description: item.description })}
            />
          ))}
        </div>
      </div>
    );
  };

  const ImageModal = ({ imageData, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(imageData.currentIndex);

    const nextImage = () => {
      setCurrentIndex((prev) => (prev + 1) % imageData.images.length);
    };

    const prevImage = () => {
      setCurrentIndex((prev) => (prev - 1 + imageData.images.length) % imageData.images.length);
    };

    return (
      <div className="image-modal" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          
          <div className="modal-image-container">
            {imageData.images.length > 1 && (
              <button className="nav-btn prev" onClick={prevImage}>‹</button>
            )}
            
            <img 
              src={imageData.images[currentIndex]} 
              alt={`${imageData.description} ${currentIndex + 1}`}
              className="modal-image"
            />
            
            {imageData.images.length > 1 && (
              <button className="nav-btn next" onClick={nextImage}>›</button>
            )}
          </div>
          
          {imageData.images.length > 1 && (
            <div className="image-counter">
              {currentIndex + 1} of {imageData.images.length}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="items-grid">
        {items.map(item => (
          <div key={item.id} className="item-card">
            {currentUser?.isAdmin && (
              <button
                className="delete-btn"
                onClick={() => onDelete(item.id)}
                title="Delete item"
              >
                ×
              </button>
            )}
            
            {renderItemImages(item)}
            
            <div className="item-info">
              <div className="item-description">{item.description}</div>
              
              <div className="voting-section">
                <div className="vote-buttons">
                  <button 
                    className={`vote-btn keep ${(item.votes && item.votes[currentUser?.id]) === 'keep' ? 'voted' : ''}`}
                    onClick={() => onVote(item.id, 'keep')}
                  >
                    💚 Keep
                  </button>
                  <button 
                    className={`vote-btn charity ${(item.votes && item.votes[currentUser?.id]) === 'charity' ? 'voted' : ''}`}
                    onClick={() => onVote(item.id, 'charity')}
                  >
                    🤝 Charity
                  </button>
                  <button 
                    className={`vote-btn sell ${(item.votes && item.votes[currentUser?.id]) === 'sell' ? 'voted' : ''}`}
                    onClick={() => onVote(item.id, 'sell')}
                  >
                    💰 Sell
                  </button>
                  <button 
                    className={`vote-btn trash ${(item.votes && item.votes[currentUser?.id]) === 'trash' ? 'voted' : ''}`}
                    onClick={() => onVote(item.id, 'trash')}
                  >
                    🗑️ Trash
                  </button>
                </div>
                
                <div 
                  className="vote-summary"
                  dangerouslySetInnerHTML={{ __html: generateVoteSummary(item) }}
                />
              </div>
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

      {expandedImage && (
        <ImageModal 
          imageData={expandedImage} 
          onClose={() => setExpandedImage(null)} 
        />
      )}
    </>
  );
};

export default ItemsGrid;