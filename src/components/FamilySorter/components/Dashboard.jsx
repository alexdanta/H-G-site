import React from 'react';
import styles from '../FamilySorter.module.css';
import { getStatusIndicator } from '../utils/dataUtils'; // Import the correct function

const Dashboard = ({ items = [], currentSort, onSortChange }) => {
    // UPDATED: Exclude Laura from all analytics
    const activeVoters = ['alexander', 'celestin', 'do-rachelle']; // Laura removed
    const totalActiveVoters = activeVoters.length; // Now 3 instead of 4

    // REMOVED: Built-in status indicator function - now using the one from dataUtils.jsx

    const updateVotingProgress = () => {
        const totalItems = items.length;
        // Only count votes from active voters (exclude Laura)
        const votedItems = items.filter(item => {
            const activeVotes = Object.keys(item.votes || {}).filter(userId => activeVoters.includes(userId));
            return activeVotes.length > 0;
        }).length;
        
        const decidedItems = items.filter(item => {
            // Only consider votes from active voters
            const activeVotes = Object.entries(item.votes || {})
                .filter(([userId]) => activeVoters.includes(userId))
                .map(([, vote]) => vote);
            return activeVotes.length > 0 && activeVotes.every(v => v === activeVotes[0]);
        }).length;

        const votedPercentage = totalItems > 0 ? (votedItems / totalItems) * 100 : 0;
        const decidedPercentage = totalItems > 0 ? (decidedItems / totalItems) * 100 : 0;

        return {
            totalItems,
            votedItems,
            decidedItems,
            votedPercentage,
            decidedPercentage
        };
    };

    const updateCategoryBreakdown = () => {
        const categoryCounts = {
            keep: 0,
            charity: 0,
            sell: 0,
            trash: 0
        };

        items.forEach(item => {
            // Only consider votes from active voters (exclude Laura)
            const activeVotes = Object.entries(item.votes || {})
                .filter(([userId]) => activeVoters.includes(userId))
                .map(([, vote]) => vote);
                
            if (activeVotes.length > 0) {
                const voteCount = {};
                activeVotes.forEach(vote => {
                    voteCount[vote] = (voteCount[vote] || 0) + 1;
                });
                const leadingVote = Object.entries(voteCount).reduce((a, b) =>
                    voteCount[a[0]] > voteCount[b[0]] ? a : b
                )[0];

                if (categoryCounts[leadingVote] !== undefined) {
                    categoryCounts[leadingVote]++;
                }
            }
        });

        return categoryCounts;
    };

    const updateFamilyParticipation = () => {
        const totalItems = items.length;

        // UPDATED: Only show active voters (exclude Laura)
        return activeVoters.map(member => {
            const memberVotes = items.filter(item => item.votes && item.votes[member]).length;
            const percentage = totalItems > 0 ? (memberVotes / totalItems) * 100 : 0;
            const displayName = member.charAt(0).toUpperCase() + member.slice(1).replace('-', '-');

            return {
                member,
                displayName,
                memberVotes,
                totalItems,
                percentage
            };
        });
    };

    const getSortedItems = () => {
        let sortedItems = [...items];

        if (currentSort === 'votes') {
            sortedItems.sort((a, b) => {
                // Only count votes from active voters
                const aVotes = Object.keys(a.votes || {}).filter(userId => activeVoters.includes(userId)).length;
                const bVotes = Object.keys(b.votes || {}).filter(userId => activeVoters.includes(userId)).length;
                return bVotes - aVotes;
            });
        } else if (currentSort === 'recent') {
            sortedItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } else if (currentSort === 'conflicts') {
            sortedItems.sort((a, b) => {
                const aConflict = hasConflict(a);
                const bConflict = hasConflict(b);
                if (aConflict && !bConflict) return -1;
                if (!aConflict && bConflict) return 1;
                // Only count active voter votes
                const aActiveVotes = Object.keys(a.votes || {}).filter(userId => activeVoters.includes(userId)).length;
                const bActiveVotes = Object.keys(b.votes || {}).filter(userId => activeVoters.includes(userId)).length;
                return bActiveVotes - aActiveVotes;
            });
        }

        return sortedItems;
    };

    const hasConflict = (item) => {
        // Only consider active voters for conflicts
        const activeVotes = Object.entries(item.votes || {})
            .filter(([userId]) => activeVoters.includes(userId))
            .map(([, vote]) => vote);
        if (activeVotes.length < 2) return false;
        const voteSet = new Set(activeVotes);
        return voteSet.size > 1;
    };

    const renderRankedItem = (item) => {
        // Only count votes from active voters (exclude Laura)
        const activeVoteCount = Object.keys(item.votes || {}).filter(userId => activeVoters.includes(userId)).length;

        let priorityClass = 'low';
        let priorityText = `${activeVoteCount}/${totalActiveVoters} voted`; // Now shows x/3

        if (activeVoteCount === totalActiveVoters) {
            priorityClass = 'high';
            priorityText = 'All voted';
        } else if (activeVoteCount >= 2) {
            priorityClass = 'medium';
            priorityText = `${activeVoteCount}/${totalActiveVoters} voted`;
        }

        const statusIndicator = getStatusIndicator(item); // Now using the correct function from dataUtils.jsx

        // FIXED: Only show active voters (exclude Laura completely)
        const familyVotesHTML = activeVoters.map(member => {
            const vote = item.votes && item.votes[member];
            const voteClass = vote || 'noVote';
            const voteIcon = {
                keep: '💚',
                charity: '🤝',
                sell: '💰',
                trash: '🗑️',
                'noVote': '⏳'
            }[voteClass];

            const voteText = {
                keep: ' Keep',
                charity: ' Charity',
                sell: ' Sell',
                trash: ' Trash',
                'noVote': ' Not voted yet'
            }[voteClass];

            const memberDisplayName = member.charAt(0).toUpperCase() + member.slice(1).replace('-', '-');

            return (
                <div key={member} className={`${styles.familyVote} ${styles[voteClass]}`}>
                    <span>
                        <span className={styles.voteIcon}>{voteIcon}</span>
                        {memberDisplayName}
                    </span>
                    <span>{voteText}</span>
                </div>
            );
        });

        return (
            <div key={item.id} className={styles.rankedItem}>
                <img src={item.image || item.primaryImage} alt={item.description} className={styles.rankedItemImage} />
                <div className={styles.rankedItemContent}>
                    <div className={styles.rankedItemHeader}>
                        <h4 className={styles.rankedItemTitle}>{item.description}</h4>
                        <div className={`${styles.votePriority} ${styles[priorityClass]}`}>{priorityText}</div>
                    </div>
                    {statusIndicator && (
                        <div className={`${styles.statusIndicator} ${styles[statusIndicator.type]}`}>
                            {statusIndicator.message}
                        </div>
                    )}
                    <div className={styles.familyVotesDisplay}>
                        {familyVotesHTML}
                    </div>
                </div>
            </div>
        );
    };

    const progress = updateVotingProgress();
    const categoryBreakdown = updateCategoryBreakdown();
    const familyParticipation = updateFamilyParticipation();
    const sortedItems = getSortedItems();

    return (
        <div className={`${styles.dashboard} ${styles.active}`}>
            <div className={styles.dashboardGrid}>
                <div className={styles.dashboardCard}>
                    <h3>📊 Voting Progress</h3>
                    <div className={styles.votingProgress}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span>Items with votes</span>
                            <span>{progress.votedItems}/{progress.totalItems}</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${progress.votedPercentage}%` }}></div>
                        </div>
                    </div>
                    <div className={styles.votingProgress}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span>Decided items</span>
                            <span>{progress.decidedItems}/{progress.totalItems}</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${progress.decidedPercentage}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className={styles.dashboardCard}>
                    <h3>🎯 Category Breakdown</h3>
                    <div className={styles.categoryBreakdown}>
                        <div className={`${styles.categoryStat} ${styles.keep}`}>
                            <div className={styles.categoryNumber}>{categoryBreakdown.keep}</div>
                            <div className={styles.categoryLabel}>Keep</div>
                        </div>
                        <div className={`${styles.categoryStat} ${styles.charity}`}>
                            <div className={styles.categoryNumber}>{categoryBreakdown.charity}</div>
                            <div className={styles.categoryLabel}>Charity</div>
                        </div>
                        <div className={`${styles.categoryStat} ${styles.sell}`}>
                            <div className={styles.categoryNumber}>{categoryBreakdown.sell}</div>
                            <div className={styles.categoryLabel}>Sell</div>
                        </div>
                        <div className={`${styles.categoryStat} ${styles.trash}`}>
                            <div className={styles.categoryNumber}>{categoryBreakdown.trash}</div>
                            <div className={styles.categoryLabel}>Trash</div>
                        </div>
                    </div>
                </div>

                <div className={styles.dashboardCard}>
                    <h3>👥 Family Participation</h3>
                    {familyParticipation.map(member => (
                        <div key={member.member}>
                            <div className={styles.memberStats}>
                                <div className={styles.memberName}>{member.displayName}</div>
                                <div className={styles.memberVotes}>{member.memberVotes}/{member.totalItems} votes</div>
                            </div>
                            <div className={styles.progressBar} style={{ marginBottom: '15px' }}>
                                <div className={styles.progressFill} style={{ width: `${member.percentage}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.dashboardCard}>
                    <h3>⚡ Sort Options</h3>
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
            </div>

            <div className={styles.dashboardCard}>
                <h3>🏆 Items Ranked by Priority</h3>
                <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                    Items with the most votes appear first. See who wants what to make family decisions.
                </p>
                <div>
                    {sortedItems.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#6c757d', padding: '40px' }}>
                            No items added yet. Add some items to see the ranking!
                        </div>
                    ) : (
                        sortedItems.map(renderRankedItem)
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;