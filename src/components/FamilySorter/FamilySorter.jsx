import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from './components/Header';
import Controls from './components/Controls';
import ItemsGrid from './components/ItemsGrid';
import Dashboard from './components/Dashboard';
import AddItemsTab from './components/addItemsTab';
import ContentManagementTab from './components/ContentManagementTab';
import ExportButton from './components/ExportButton';
import { compressImage, saveItem, loadItems, updateItem, deleteItem, resetAllVotes } from './utils/dataUtils.jsx';
import styles from './FamilySorter.module.css';

const FamilySorter = () => {
  const [items, setItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [itemIdCounter, setItemIdCounter] = useState(0);
  const [currentView, setCurrentView] = useState('items'); // Now includes 'add-items'
  const [currentSort, setCurrentSort] = useState('votes');
  const [isLoading, setIsLoading] = useState(true);
  
  
  const { userProfile } = useAuth();

  useEffect(() => {
    loadItems(setItems, setItemIdCounter);
    setIsLoading(false);
  }, []);

  // Auto-login effect: Map site user to family sorter user
  useEffect(() => {
    if (userProfile) {
      const emailToUserId = {
        'alexander@herbe-george.com': 'alexander',
        'scelestinherbegeorge@gmail.com': 'celestin',
        'dodorachelle@gmail.com': 'do-rachelle',
        'laura@herbe-george.com': 'laura'
      };

      const userId = emailToUserId[userProfile.email];
      
      if (userId) {
        const familyUser = {
          id: userId,
          name: userProfile.displayName,
          isAdmin: userProfile.role === 'admin'
        };
        setCurrentUser(familyUser);
      }
    }
  }, [userProfile]);

  const handleLogout = () => {
    window.location.href = '/dashboard';
  };

  const handleAddItem = async (photoFiles, description) => {
    if (!currentUser?.isAdmin) {
      alert('Only Alexander can add items.');
      return false;
    }

    if (!photoFiles || photoFiles.length === 0) {
      alert('Please add at least one photo.');
      return false;
    }

    try {
      console.log(`Compressing ${photoFiles.length} photos...`);
      
      // IMPROVED: Better compression for smaller file sizes
      const compressedImages = await Promise.all(
        photoFiles.map(async (file, index) => {
          console.log(`Compressing photo ${index + 1}/${photoFiles.length}...`);
          // Smaller dimensions and higher compression for storage efficiency
          return await compressImage(file, 600, 0.6);
        })
      );

      console.log('All photos compressed successfully');

      const newItemData = {
        images: compressedImages,
        primaryImage: compressedImages[0],
        description: description.trim(),
        votes: {},
        timestamp: new Date().toISOString(),
        addedBy: currentUser.id
      };

      // NEW: Save individual item
      const result = await saveItem(newItemData);
      
      if (result.success) {
        // Add to local state with the Firebase-generated ID
        const newItem = {
          id: result.id,
          ...newItemData
        };
        
        setItems(prevItems => [newItem, ...prevItems]); // Add to beginning (newest first)
        console.log('Item added successfully!');
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      if (error.message.includes('size') || error.message.includes('1048576')) {
        alert('Images are too large! Try using fewer photos or smaller images.');
      } else if (error.name === 'QuotaExceededError') {
        alert('Storage is full! Try deleting some items or use smaller images.');
      } else {
        alert('Error adding item. Please try again.');
      }
      return false;
    }
  };

  const handleVote = async (itemId, choice) => {
    try {
      // Find the item to get current votes
      const item = items.find(item => item.id === itemId);
      if (!item) return;

      const updatedVotes = {
        ...item.votes,
        [currentUser.id]: choice
      };

      // NEW: Update individual item
      const result = await updateItem(itemId, { votes: updatedVotes });
      
      if (result.success) {
        // Update local state
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === itemId 
              ? { ...item, votes: updatedVotes }
              : item
          )
        );
        console.log('Vote saved successfully');
      } else {
        console.error('Failed to save vote:', result.error);
        alert('Failed to save vote. Please try again.');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Error saving vote. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!currentUser?.isAdmin) {
      alert('Only Alexander can delete items.');
      return;
    }

    if (confirm('Are you sure you want to delete this item? This cannot be undone.')) {
      try {
        // NEW: Delete individual item
        const result = await deleteItem(itemId);
        
        if (result.success) {
          // Update local state
          setItems(prevItems => prevItems.filter(item => item.id !== itemId));
          console.log('Item deleted successfully');
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Please try again.');
      }
    }
  };

  const handleResetVotes = async () => {
    if (!currentUser?.isAdmin) {
      alert('Only Alexander can reset votes.');
      return;
    }

    if (confirm('Are you sure you want to reset ALL votes? This cannot be undone.')) {
      try {
        // NEW: Reset all votes using new function
        const result = await resetAllVotes();
        
        if (result.success) {
          // Update local state
          setItems(prevItems => 
            prevItems.map(item => ({
              ...item,
              votes: {}
            }))
          );
          alert('All votes have been reset!');
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Error resetting votes:', error);
        alert('Error resetting votes. Please try again.');
      }
    }
  };

  const handleExport = () => {
    if (!currentUser?.isAdmin) {
      alert('Only Alexander can export results.');
      return;
    }

    const results = items.map(item => {
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

  if (!currentUser) {
    return (
      <div className={styles.familySorter}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: '#6c757d',
          textAlign: 'center'
        }}>
          <h2>Access Denied</h2>
          <p>Your account doesn't have access to the Family Sorter.</p>
          <button onClick={() => window.history.back()}>← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  // Render the appropriate view based on currentView
  const renderCurrentView = () => {
    switch (currentView) {
      case 'items':
        return (
          <ItemsGrid
            items={items || []}
            currentUser={currentUser}
            onVote={handleVote}
            onDelete={handleDeleteItem}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            items={items || []}
            currentSort={currentSort}
            onSortChange={setCurrentSort}
          />
        );
      case 'add-items':
        return (
          <AddItemsTab
            currentUser={currentUser}
            onAddItem={handleAddItem}
          />
        );
      case 'content-management':
        return (
          <ContentManagementTab
            currentUser={currentUser}
            items={items || []}
            onResetVotes={handleResetVotes}
            onDelete={handleDeleteItem}
          />
        );
      default:
        return (
          <ItemsGrid
            items={items || []}
            currentUser={currentUser}
            onVote={handleVote}
            onDelete={handleDeleteItem}
          />
        );
    }
  };

  return (
    <div className={styles.familySorter}>
      <div className={styles.container}>
        <Header 
          currentUser={currentUser} 
          items={items || []} 
          onLogout={handleLogout}
        />
        
        <Controls
          currentView={currentView}
          currentSort={currentSort}
          onViewChange={setCurrentView}
          onSortChange={setCurrentSort}
        />

        {renderCurrentView()}

        {currentUser.isAdmin && currentView === 'dashboard' && (
          <ExportButton onExport={handleExport} />
        )}
      </div>
    </div>
  );
};

export default FamilySorter;