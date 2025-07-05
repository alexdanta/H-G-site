import React from 'react';

const ItemsGrid = ({ items = [], currentUser, onVote, onDelete }) => {
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

    return (
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

                    <img
                        src={item.image}
                        alt={item.description}
                        className="item-image"
                    />

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
    );
};

export default ItemsGrid;