import React from 'react';
import styles from '../FamilySorter.module.css';

const Controls = ({ currentView, currentSort, onViewChange, onSortChange }) => {
  return (
    <div className={styles.controls}>
      {/* Tab Navigation */}
      <div className={styles.viewSelector}>
        <button
          className={`${styles.viewBtn} ${currentView === 'items' ? styles.active : ''}`}
          onClick={() => onViewChange('items')}
        >
          📋 Items View
        </button>
        <button
          className={`${styles.viewBtn} ${currentView === 'dashboard' ? styles.active : ''}`}
          onClick={() => onViewChange('dashboard')}
        >
          📊 Analytics
        </button>
        <button
          className={`${styles.viewBtn} ${currentView === 'add-items' ? styles.active : ''}`}
          onClick={() => onViewChange('add-items')}
        >
          ➕ Add Items
        </button>
        <button
          className={`${styles.viewBtn} ${currentView === 'content-management' ? styles.active : ''}`}
          onClick={() => onViewChange('content-management')}
        >
          🛠️ Management
        </button>
      </div>

      {/* Sort Options - Only show in Analytics view */}
      {currentView === 'dashboard' && (
        <div className={styles.sortOptionsSection}>
          <h4 style={{ margin: '20px 0 10px 0', color: '#333' }}>🔄 Sort Options</h4>
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
        </div>
      )}
    </div>
  );
};

export default Controls;