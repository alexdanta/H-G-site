import React from 'react';
import styles from '../FamilySorter.module.css';

const Header = ({ currentUser, items = [], onLogout, onResetVotes }) => {
    const totalItems = items.length;
    const votedItems = items.filter(item => Object.keys(item.votes || {}).length > 0).length;
    const decidedItems = items.filter(item => {
        const votes = Object.values(item.votes || {});
        return votes.length > 0 && votes.every(v => v === votes[0]);
    }).length;

    return (
        <div className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.headerLeft}>
                    <h1>Family Item Sorting</h1>
                    <p>Help decide what to do with each item</p>
                </div>
                <div className={styles.headerRight}>
                    {currentUser.isAdmin && (
                        <button 
                            className={styles.logoutBtn} 
                            onClick={onResetVotes}
                            style={{ marginRight: '10px', background: 'rgba(220, 53, 69, 0.8)' }}
                        >
                            🔄 Reset Votes
                        </button>
                    )}
                    <button className={styles.logoutBtn} onClick={onLogout}>
                        ← Dashboard
                    </button>
                </div>
            </div>
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <div className={styles.statNumber}>{totalItems}</div>
                    <div className={styles.statLabel}>Total Items</div>
                </div>
                <div className={styles.stat}>
                    <div className={styles.statNumber}>{votedItems}</div>
                    <div className={styles.statLabel}>Items Voted</div>
                </div>
                <div className={styles.stat}>
                    <div className={styles.statNumber}>{decidedItems}</div>
                    <div className={styles.statLabel}>Decided</div>
                </div>
            </div>
        </div>
    );
};

export default Header;