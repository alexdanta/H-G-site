import React from 'react';
import styles from '../FamilySorter.module.css';

const Header = ({ currentUser, items = [], onLogout }) => {
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
                    <div className={styles.userInfo}>
                        <div className={`${styles.userAvatar} ${styles[currentUser.id]}`}>
                            {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{currentUser.name}</span>
                        {currentUser.isAdmin && (
                            <span className={styles.adminBadge}>Admin</span>
                        )}
                    </div>
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