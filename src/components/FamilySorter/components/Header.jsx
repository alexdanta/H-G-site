import React from 'react';

const Header = ({ currentUser, items = [], onLogout }) => {
    const totalItems = items.length;
    const votedItems = items.filter(item => Object.keys(item.votes || {}).length > 0).length;
    const decidedItems = items.filter(item => {
        const votes = Object.values(item.votes || {});
        return votes.length > 0 && votes.every(v => v === votes[0]);
    }).length;

    return (
        <div className="header">
            <div className="header-content">
                <div className="header-left">
                    <h1>Family Item Sorting</h1>
                    <p>Help decide what to do with each item</p>
                </div>
                <div className="header-right">
                    <div className="user-info">
                        <div className={`user-avatar ${currentUser.id}`}>
                            {currentUser.name.charAt(0)}
                        </div>
                        <span>{currentUser.name}</span>
                        {currentUser.isAdmin && (
                            <span className="admin-badge">ADMIN</span>
                        )}
                    </div>
                    <button className="logout-btn" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </div>
            <div className="stats">
                <div className="stat">
                    <div className="stat-number">{totalItems}</div>
                    <div className="stat-label">Total Items</div>
                </div>
                <div className="stat">
                    <div className="stat-number">{votedItems}</div>
                    <div className="stat-label">Items Voted</div>
                </div>
                <div className="stat">
                    <div className="stat-number">{decidedItems}</div>
                    <div className="stat-label">Decided</div>
                </div>
            </div>
        </div>
    );
};

export default Header;