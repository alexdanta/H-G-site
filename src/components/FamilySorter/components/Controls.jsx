import React, { useState } from 'react';

const Controls = ({ currentUser, currentView, currentSort, items = [], onViewChange, onSortChange, onAddItem }) => {
    const [photoFile, setPhotoFile] = useState(null);
    const [description, setDescription] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddItem = async () => {
        if (!photoFile || !description.trim()) {
            alert('Please add both a photo and description!');
            return;
        }

        setIsAdding(true);
        const success = await onAddItem(photoFile, description);

        if (success) {
            setPhotoFile(null);
            setDescription('');
            // Reset file input
            const fileInput = document.getElementById('photoInput');
            if (fileInput) fileInput.value = '';
        }

        setIsAdding(false);
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
                    <div className="file-input-wrapper">
                        <input
                            type="file"
                            id="photoInput"
                            accept="image/*"
                            onChange={(e) => setPhotoFile(e.target.files[0])}
                        />
                        <label htmlFor="photoInput" className="file-input-label">
                            📷 Add Photo
                        </label>
                    </div>
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
                        {isAdding ? 'Processing...' : 'Add Item'}
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