// Import the authenticated Firebase instances from AuthContext
import { db } from '../../../contexts/AuthContext';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';

console.log('Using shared authenticated Firebase connection');

// Image compression utility - INCREASED compression for smaller files
export const compressImage = (file, maxWidth = 600, quality = 0.6) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function () {
            let { width, height } = img;

            // Reduce max width for smaller file sizes
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Increased compression
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            console.log(`Image compressed: ${file.size} bytes -> ${Math.round(compressedDataUrl.length * 0.75)} bytes`);
            resolve(compressedDataUrl);
        };

        img.src = URL.createObjectURL(file);
    });
};

// NEW: Save each item as a separate document
export const saveItem = async (itemData) => {
    try {
        const itemsCollection = collection(db, 'items');
        const docRef = await addDoc(itemsCollection, {
            ...itemData,
            timestamp: new Date().toISOString(),
            votes: itemData.votes || {}
        });
        console.log('Item saved successfully with ID:', docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error saving item:', error);
        return { success: false, error: error.message };
    }
};

// Migration function to move old data structure to new structure
export const migrateOldData = async () => {
    try {
        console.log('🔄 Checking for old data to migrate...');
        
        // Check for old data structure
        const oldDocRef = doc(db, 'family-data', 'items');
        const oldDocSnap = await getDoc(oldDocRef);
        
        if (oldDocSnap.exists()) {
            const oldData = oldDocSnap.data();
            const oldItems = oldData.items || [];
            
            if (oldItems.length > 0) {
                console.log(`📦 Found ${oldItems.length} items in old format. Migrating...`);
                
                // Migrate each item to new structure
                const migratedItems = [];
                for (let i = 0; i < oldItems.length; i++) {
                    const oldItem = oldItems[i];
                    
                    try {
                        // Convert old item to new format
                        const newItemData = {
                            images: oldItem.images || (oldItem.image ? [oldItem.image] : []),
                            primaryImage: oldItem.primaryImage || oldItem.image,
                            description: oldItem.description,
                            votes: oldItem.votes || {},
                            timestamp: oldItem.timestamp || new Date().toISOString(),
                            addedBy: oldItem.addedBy || 'unknown',
                            // Keep original ID for reference
                            originalId: oldItem.id
                        };
                        
                        // Save to new structure
                        const itemsCollection = collection(db, 'items');
                        const docRef = await addDoc(itemsCollection, newItemData);
                        
                        migratedItems.push({
                            id: docRef.id,
                            ...newItemData
                        });
                        
                        console.log(`✅ Migrated item ${i + 1}/${oldItems.length}: ${oldItem.description}`);
                        
                    } catch (itemError) {
                        console.error(`❌ Failed to migrate item ${i + 1}:`, itemError);
                    }
                }
                
                console.log(`🎉 Migration complete! Migrated ${migratedItems.length} items`);
                console.log('💡 Your old data is still safe in family-data/items');
                console.log('🗑️ You can delete the old data later if everything works well');
                
                return migratedItems;
            } else {
                console.log('ℹ️ No items found in old format');
                return [];
            }
        } else {
            console.log('ℹ️ No old data found to migrate');
            return [];
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        return [];
    }
};

// NEW: Load all items from separate documents
export const loadItems = async (setItems, setItemIdCounter) => {
    try {
        console.log('📋 Loading items...');
        
        // First, try to load from new structure
        const itemsCollection = collection(db, 'items');
        const querySnapshot = await getDocs(itemsCollection);
        
        let itemsList = [];
        querySnapshot.forEach((doc) => {
            itemsList.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // If no items found in new structure, try to migrate old data
        if (itemsList.length === 0) {
            console.log('🔄 No items found in new structure, checking for old data...');
            itemsList = await migrateOldData();
        }

        // Sort by timestamp (newest first)
        itemsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setItems(itemsList);
        setItemIdCounter(itemsList.length);
        console.log(`✅ Loaded ${itemsList.length} items successfully`);
        
    } catch (error) {
        console.error('❌ Error loading items:', error);
        alert('Failed to load items. Please check your connection and try again.');
        setItems([]);
        setItemIdCounter(0);
    }
};

// NEW: Update individual item (for voting)
export const updateItem = async (itemId, updates) => {
    try {
        const itemRef = doc(db, 'items', itemId);
        await setDoc(itemRef, updates, { merge: true });
        console.log('Item updated successfully:', itemId);
        return { success: true };
    } catch (error) {
        console.error('Error updating item:', error);
        return { success: false, error: error.message };
    }
};

// NEW: Delete individual item
export const deleteItem = async (itemId) => {
    try {
        const itemRef = doc(db, 'items', itemId);
        await deleteDoc(itemRef);
        console.log('Item deleted successfully:', itemId);
        return { success: true };
    } catch (error) {
        console.error('Error deleting item:', error);
        return { success: false, error: error.message };
    }
};

// NEW: Reset all votes
export const resetAllVotes = async () => {
    try {
        const itemsCollection = collection(db, 'items');
        const querySnapshot = await getDocs(itemsCollection);
        
        const updatePromises = [];
        querySnapshot.forEach((doc) => {
            const itemRef = doc.ref;
            updatePromises.push(setDoc(itemRef, { votes: {} }, { merge: true }));
        });

        await Promise.all(updatePromises);
        console.log('All votes reset successfully');
        return { success: true };
    } catch (error) {
        console.error('Error resetting votes:', error);
        return { success: false, error: error.message };
    }
};

// LEGACY: Keep old functions for backward compatibility but mark as deprecated
export const saveItems = async (items, itemIdCounter) => {
    console.warn('saveItems is deprecated. Use saveItem for individual items.');
    // This function is no longer used with the new structure
};

// Built-in status indicator function with improved priority logic
export const getStatusIndicator = (item) => {
    const activeFamilyMembers = ['alexander', 'celestin', 'do-rachelle']; // Laura excluded
    const totalActiveMembers = activeFamilyMembers.length; // 3 members

    if (!item.votes || Object.keys(item.votes).length === 0) return null;

    // Only count votes from active members (exclude Laura completely)
    const activeVotes = {};
    activeFamilyMembers.forEach(member => {
        if (item.votes[member]) {
            activeVotes[member] = item.votes[member];
        }
    });

    const activeVoteValues = Object.values(activeVotes);
    const votedCount = activeVoteValues.length;

    if (votedCount === 0) return null;

    // Count votes for each option
    const voteCounts = {};
    activeVoteValues.forEach(vote => {
        voteCounts[vote] = (voteCounts[vote] || 0) + 1;
    });

    // PRIORITY 1: Check for "keep" votes first - THIS TAKES ABSOLUTE PRIORITY
    const keepVotes = voteCounts.keep || 0;
    
    if (keepVotes === 1) {
        // One person wants to keep it - this takes priority over everything else
        const keeperName = activeFamilyMembers.find(member => activeVotes[member] === 'keep');
        const displayName = keeperName.charAt(0).toUpperCase() + keeperName.slice(1).replace('-', '-');
        
        if (votedCount === totalActiveMembers) {
            return {
                type: 'success',
                message: `✅ Going to ${displayName} - they want it!`
            };
        } else {
            return {
                type: 'success',
                message: `✅ Going to ${displayName} - they want it! (others can still vote)`
            };
        }
    } 
    
    if (keepVotes === 2) {
        // Two people want to keep - this is a real conflict
        const keeperNames = activeFamilyMembers
            .filter(member => activeVotes[member] === 'keep')
            .map(member => member.charAt(0).toUpperCase() + member.slice(1).replace('-', '-'));
        
        return {
            type: 'conflict',
            message: `⚠️ ${keeperNames.join(' & ')} both want this - discussion needed`
        };
    } 
    
    if (keepVotes === 3) {
        // Everyone wants to keep it
        return {
            type: 'success',
            message: `✅ Everyone wants to keep this!`
        };
    }

    // PRIORITY 2: If no keep votes, find the leading option among other choices
    const nonKeepVotes = { ...voteCounts };
    delete nonKeepVotes.keep; // Remove keep votes from consideration
    
    if (Object.keys(nonKeepVotes).length === 0) {
        // This shouldn't happen, but just in case
        return null;
    }

    const maxVotes = Math.max(...Object.values(nonKeepVotes));
    const leadingChoices = Object.entries(nonKeepVotes).filter(([_, count]) => count === maxVotes);

    if (leadingChoices.length === 1) {
        const [choice, count] = leadingChoices[0];
        const percentage = Math.round((count / votedCount) * 100);
        
        const choiceText = {
            charity: 'Going to charity',
            sell: 'Going to be sold',
            trash: 'Going in the trash'
        }[choice];

        if (choiceText) {
            if (votedCount === totalActiveMembers) {
                const voteText = count === totalActiveMembers ? 'unanimous' : `${percentage}% (${count}/${totalActiveMembers})`;
                return {
                    type: 'success',
                    message: `✅ ${choiceText} (${voteText})`
                };
            } else {
                return {
                    type: 'leading',
                    message: `📊 Leading: ${choiceText} (${percentage}% - ${count}/${votedCount} votes so far)`
                };
            }
        }
    } else {
        // True tie between non-keep options (only show if no keep votes)
        const tiedChoices = leadingChoices.map(([choice]) => 
            ({ charity: 'charity', sell: 'sell', trash: 'trash' }[choice])
        ).filter(Boolean);

        if (votedCount === totalActiveMembers) {
            return {
                type: 'conflict',
                message: `⚠️ Tied vote: ${tiedChoices.join(' vs ')} - family discussion needed`
            };
        } else {
            return {
                type: 'conflict',
                message: `⚠️ Currently tied: ${tiedChoices.join(' vs ')} (${maxVotes} votes each)`
            };
        }
    }

    // If we somehow get here, show who still needs to vote
    const remainingVoters = activeFamilyMembers.filter(member => !activeVotes[member]);
    const remainingNames = remainingVoters.map(member =>
        member.charAt(0).toUpperCase() + member.slice(1).replace('-', '-')
    );

    return {
        type: 'waiting',
        message: `⏳ Waiting for ${remainingNames.join(', ')} to vote`
    };
};