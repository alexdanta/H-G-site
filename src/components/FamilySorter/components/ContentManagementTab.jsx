import React, { useState } from 'react';
import styles from '../FamilySorter.module.css';

const ContentManagementTab = ({ currentUser, items = [], onResetVotes, onDelete }) => {
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!currentUser?.isAdmin) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#6c757d'
      }}>
        <h3>🔒 Admin Access Required</h3>
        <p>Only Alexander can access content management tools.</p>
      </div>
    );
  }

  const handleResetVotes = () => {
    if (confirmReset) {
      onResetVotes();
      setConfirmReset(false);
      setShowDangerZone(false);
    } else {
      setConfirmReset(true);
    }
  };

  const getItemStats = () => {
    const totalItems = items.length;
    const votedItems = items.filter(item => 
      Object.keys(item.votes || {}).length > 0
    ).length;
    const totalVotes = items.reduce((sum, item) => 
      sum + Object.keys(item.votes || {}).length, 0
    );

    return { totalItems, votedItems, totalVotes };
  };

  const stats = getItemStats();

  return (
    <div className={styles.contentManagementTab}>
      <div className={styles.managementHeader}>
        <h2>🛠️ Content Management</h2>
        <p>Manage items, votes, and data for the Family Sorter</p>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsOverview}>
        <h3>📊 Current Status</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.totalItems}</div>
            <div className={styles.statLabel}>Total Items</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.votedItems}</div>
            <div className={styles.statLabel}>Items with Votes</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.totalVotes}</div>
            <div className={styles.statLabel}>Total Votes Cast</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              {stats.totalItems > 0 ? Math.round((stats.votedItems / stats.totalItems) * 100) : 0}%
            </div>
            <div className={styles.statLabel}>Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Item Management */}
      <div className={styles.managementSection}>
        <h3>📦 Item Management</h3>
        <p style={{ color: '#6c757d', marginBottom: '20px' }}>
          Delete individual items. This action cannot be undone.
        </p>
        
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No items to manage.</p>
          </div>
        ) : (
          <div className={styles.itemsList}>
            {items.map(item => (
              <div key={item.id} className={styles.managementItem}>
                <div className={styles.itemInfo}>
                  <img 
                    src={item.primaryImage || item.image || (item.images && item.images[0])} 
                    alt={item.description}
                    className={styles.itemThumbnail}
                  />
                  <div className={styles.itemDetails}>
                    <h4>{item.description}</h4>
                    <p>
                      Added: {new Date(item.timestamp).toLocaleDateString()} • 
                      Votes: {Object.keys(item.votes || {}).length} • 
                      Images: {(item.images || [item.image]).filter(Boolean).length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(item.id)}
                  className={styles.deleteItemBtn}
                  title="Delete this item permanently"
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className={styles.dangerZone}>
        <div className={styles.dangerHeader} onClick={() => setShowDangerZone(!showDangerZone)}>
          <h3>⚠️ Danger Zone</h3>
          <button className={styles.toggleBtn}>
            {showDangerZone ? '−' : '+'}
          </button>
        </div>
        
        {showDangerZone && (
          <div className={styles.dangerContent}>
            <div className={styles.warningBox}>
              <h4>🚨 Reset All Votes</h4>
              <p>
                This will permanently delete ALL votes from ALL items. 
                Family members will need to vote again from scratch.
              </p>
              <p><strong>This action cannot be undone!</strong></p>
              
              {!confirmReset ? (
                <button 
                  onClick={() => setConfirmReset(true)}
                  className={styles.dangerBtn}
                >
                  Reset All Votes
                </button>
              ) : (
                <div className={styles.confirmSection}>
                  <p style={{ color: '#dc3545', fontWeight: 'bold', marginBottom: '10px' }}>
                    Are you absolutely sure? This will delete {stats.totalVotes} votes!
                  </p>
                  <div className={styles.confirmButtons}>
                    <button 
                      onClick={handleResetVotes}
                      className={styles.confirmDangerBtn}
                    >
                      ✅ Yes, Reset Everything
                    </button>
                    <button 
                      onClick={() => setConfirmReset(false)}
                      className={styles.cancelBtn}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Safety Tips */}
      <div className={styles.safetyTips}>
        <h3>💡 Safety Tips</h3>
        <ul>
          <li><strong>Export data first:</strong> Use Analytics → Export before making major changes</li>
          <li><strong>Deleting items:</strong> Removes all associated photos and votes permanently</li>
          <li><strong>Resetting votes:</strong> Only do this if you want to restart the voting process</li>
          <li><strong>Backup strategy:</strong> Consider screenshots of important decisions</li>
        </ul>
      </div>
    </div>
  );
};

export default ContentManagementTab;