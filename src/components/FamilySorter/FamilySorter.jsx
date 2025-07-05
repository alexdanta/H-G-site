import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import Controls from './components/Controls';
import ItemsGrid from './components/ItemsGrid';
import Dashboard from './components/Dashboard';
import ExportButton from './components/ExportButton';
import { compressImage, saveItems, loadItems } from './utils/dataUtils.jsx';
import './styles/FamilySorter.css';

const FamilySorter = () => {
    const [items, setItems] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [itemIdCounter, setItemIdCounter] = useState(0);
    const [currentView, setCurrentView] = useState('items');
    const [currentSort, setCurrentSort] = useState('votes');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadItems(setItems, setItemIdCounter);
        setIsLoading(false);
    }, []);

    const handleLogin = (userId) => {
        const user = {
            id: userId,
            name: userId.charAt(0).toUpperCase() + userId.slice(1).replace('-', '-'),
            isAdmin: userId === 'alexander'
        };
        setCurrentUser(user);
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleAddItem = async (photoFile, description) => {
        if (!currentUser?.isAdmin) {
            alert('Only Alexander can add items.');
            return false;
        }

        try {
            const compressedImage = await compressImage(photoFile, 800, 0.7);
            const newItem = {
                id: itemIdCounter + 1,
                image: compressedImage,
                description: description.trim(),
                votes: {},
                timestamp: new Date().toISOString(),
                addedBy: currentUser.id
            };

            const newItems = [...items, newItem];
            setItems(newItems);
            setItemIdCounter(itemIdCounter + 1);
            saveItems(newItems, itemIdCounter + 1);
            return true;
        } catch (error) {
            console.error('Error adding item:', error);
            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                alert('Storage is full! Try deleting some items or use smaller images.');
            } else {
                alert('Error adding item. Please try again.');
            }
            return false;
        }
    };

    const handleVote = (itemId, choice) => {
        const newItems = items.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    votes: {
                        ...item.votes,
                        [currentUser.id]: choice
                    }
                };
            }
            return item;
        });

        setItems(newItems);
        saveItems(newItems, itemIdCounter);
    };

    const handleDeleteItem = (itemId) => {
        if (!currentUser?.isAdmin) {
            alert('Only Alexander can delete items.');
            return;
        }

        if (confirm('Are you sure you want to delete this item? This cannot be undone.')) {
            const newItems = items.filter(item => item.id !== itemId);
            setItems(newItems);
            saveItems(newItems, itemIdCounter);
        }
    };

    const handleExport = () => {
        if (!currentUser?.isAdmin) {
            alert('Only Alexander can export results.');
            return;
        }

        const results = items.map(item => {
            const votes = item.votes;
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

            let recommendedAction = 'No votes yet';
            if (Object.values(voteCounts).some(count => count > 0)) {
                recommendedAction = Object.entries(voteCounts).reduce((a, b) =>
                    voteCounts[a[0]] > voteCounts[b[0]] ? a : b
                )[0];
            }

            return {
                'Description': item.description,
                'Keep Votes': voteCounts.keep,
                'Charity Votes': voteCounts.charity,
                'Sell Votes': voteCounts.sell,
                'Trash Votes': voteCounts.trash,
                'Recommended Action': recommendedAction,
                'Individual Votes': Object.entries(votes).map(([member, vote]) => `${member}: ${vote}`).join(', ') || 'None',
                'Added Date': new Date(item.timestamp).toLocaleDateString(),
                'Added By': item.addedBy || 'unknown'
            };
        });

        // Convert to CSV and download
        const csvContent = convertToCSV(results);
        downloadCSV(csvContent, 'family-item-sorting-results.csv');
    };

    const convertToCSV = (objArray) => {
        const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        let str = '';

        const headers = Object.keys(array[0]);
        str += headers.join(',') + '\r\n';

        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (let index in array[i]) {
                if (line !== '') line += ',';
                line += '"' + array[i][index] + '"';
            }
            str += line + '\r\n';
        }

        return str;
    };

    const downloadCSV = (csvContent, fileName) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (!currentUser) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    // Show loading while items are being initialized
    if (isLoading) {
        return (
            <div className="family-sorter">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    fontSize: '1.2rem',
                    color: '#6c757d'
                }}>
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="family-sorter">
            <div className="container">
                <Header
                    currentUser={currentUser}
                    items={items || []}
                    onLogout={handleLogout}
                />

                <Controls
                    currentUser={currentUser}
                    currentView={currentView}
                    currentSort={currentSort}
                    items={items || []}
                    onViewChange={setCurrentView}
                    onSortChange={setCurrentSort}
                    onAddItem={handleAddItem}
                />

                {currentView === 'items' ? (
                    <ItemsGrid
                        items={items || []}
                        currentUser={currentUser}
                        onVote={handleVote}
                        onDelete={handleDeleteItem}
                    />
                ) : (
                    <Dashboard
                        items={items || []}
                        currentSort={currentSort}
                        onSortChange={setCurrentSort}
                    />
                )}

                {currentUser.isAdmin && (
                    <ExportButton onExport={handleExport} />
                )}
            </div>
        </div>
    );
};

export default FamilySorter;