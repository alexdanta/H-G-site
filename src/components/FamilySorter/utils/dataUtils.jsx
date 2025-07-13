// Firebase v9+ imports - Use ORIGINAL Firebase project for family data
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeApp } from 'firebase/app';

// ORIGINAL Firebase config for family data
const familyFirebaseConfig = {
  apiKey: "AIzaSyAS_7R16Rv9FR3kfhtgGFaL5Rjz7LIN2Yc",
  authDomain: "family-item-sorter.firebaseapp.com",
  projectId: "family-item-sorter",
  storageBucket: "family-item-sorter.firebasestorage.app",
  messagingSenderId: "287365849681",
  appId: "1:287365849681:web:b7bd0a8beb185e128c0e70"
};

// Initialize separate Firebase app for family data
const familyApp = initializeApp(familyFirebaseConfig, 'family-data-app');
const db = getFirestore(familyApp);
const storage = getStorage(familyApp);

console.log('Family Firebase services connected successfully');

// Image compression utility
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function () {
            let { width, height } = img;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            console.log(`Image compressed: ${file.size} bytes -> ${Math.round(compressedDataUrl.length * 0.75)} bytes`);
            resolve(compressedDataUrl);
        };

        img.src = URL.createObjectURL(file);
    });
};

// Data persistence functions
export const saveItems = async (items, itemIdCounter) => {
    try {
        const docRef = doc(db, 'family-data', 'items');
        await setDoc(docRef, {
            items: items,
            itemIdCounter: itemIdCounter,
            lastUpdated: new Date().toISOString()
        });
        console.log('Data saved to Firebase successfully');
    } catch (error) {
        console.error('Error saving to Firebase:', error);
        saveToLocalStorage(items, itemIdCounter);
    }
};

export const loadItems = async (setItems, setItemIdCounter) => {
    try {
        const docRef = doc(db, 'family-data', 'items');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            setItems(data.items || []);
            setItemIdCounter(data.itemIdCounter || 0);
            console.log('Data loaded from Firebase successfully');
        } else {
            console.log('No Firebase data found, starting fresh');
            setItems([]);
            setItemIdCounter(0);
        }
    } catch (error) {
        console.error('Error loading from Firebase:', error);
        loadFromLocalStorage(setItems, setItemIdCounter);
    }
};

// LocalStorage fallback functions
const saveToLocalStorage = (items, itemIdCounter) => {
    try {
        const data = JSON.stringify({
            items: items,
            itemIdCounter: itemIdCounter
        });

        const currentSize = new Blob([data]).size;
        const maxSize = 5 * 1024 * 1024; // 5MB limit

        if (currentSize > maxSize) {
            throw new Error('Data too large for localStorage');
        }

        localStorage.setItem('family-items', data);
        console.log(`Data saved to localStorage: ${Math.round(currentSize / 1024)}KB`);
    } catch (error) {
        if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
            alert('Storage full! Please delete some items to continue.');
            throw error;
        } else {
            console.error('Error saving to localStorage:', error);
            throw error;
        }
    }
};

const loadFromLocalStorage = (setItems, setItemIdCounter) => {
    try {
        const saved = localStorage.getItem('family-items');
        if (saved) {
            const data = JSON.parse(saved);
            setItems(data.items || []);
            setItemIdCounter(data.itemIdCounter || 0);
            console.log('Data loaded from localStorage');
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
};

// Vote analysis utilities
export const getStatusIndicator = (item) => {
    const votes = Object.values(item.votes || {});
    const familyMembers = ['alexander', 'celestin', 'do-rachelle', 'laura'];

    if (votes.length === 0) return '';

    const allVoted = votes.length === 4;

    if (allVoted) {
        const keepVotes = [];
        familyMembers.forEach(member => {
            if (item.votes && item.votes[member] === 'keep') {
                const displayName = member.charAt(0).toUpperCase() + member.slice(1).replace('-', '-');
                keepVotes.push(displayName);
            }
        });

        if (keepVotes.length === 1) {
            return {
                type: 'success',
                message: `✅ Going to ${keepVotes[0]} - they want it!`
            };
        } else if (keepVotes.length > 1) {
            const names = keepVotes.join(' & ');
            return {
                type: 'conflict',
                message: `⚠️ ${names} need to discuss - both want this item`
            };
        } else {
            const voteCounts = {};
            votes.forEach(vote => {
                voteCounts[vote] = (voteCounts[vote] || 0) + 1;
            });

            const maxVotes = Math.max(...Object.values(voteCounts));
            const majorityChoices = Object.entries(voteCounts).filter(([_, count]) => count === maxVotes);

            if (majorityChoices.length === 1) {
                const choice = majorityChoices[0][0];
                const choiceText = {
                    charity: 'Going to charity',
                    sell: 'Going to be sold',
                    trash: 'Going in the trash'
                }[choice];

                if (choiceText) {
                    const voteCount = majorityChoices[0][1];
                    const voteText = voteCount === 4 ? 'unanimous' : `${voteCount}/4 votes`;
                    return {
                        type: 'success',
                        message: `✅ ${choiceText} (${voteText})`
                    };
                }
            } else {
                const tiedChoices = majorityChoices.map(([choice, _]) => {
                    return { charity: 'charity', sell: 'sell', trash: 'trash' }[choice];
                }).filter(Boolean);

                return {
                    type: 'conflict',
                    message: `⚠️ Tied vote: ${tiedChoices.join(' vs ')} - family discussion needed`
                };
            }
        }
    } else {
        const remainingVoters = familyMembers.filter(member => !item.votes || !item.votes[member]);
        const remainingNames = remainingVoters.map(member =>
            member.charAt(0).toUpperCase() + member.slice(1).replace('-', '-')
        );

        const currentKeepVotes = [];
        familyMembers.forEach(member => {
            if (item.votes && item.votes[member] === 'keep') {
                const displayName = member.charAt(0).toUpperCase() + member.slice(1).replace('-', '-');
                currentKeepVotes.push(displayName);
            }
        });

        let waitingText = `Waiting for ${remainingNames.join(', ')} to vote`;

        if (currentKeepVotes.length > 0) {
            waitingText += ` (${currentKeepVotes.join(' & ')} want${currentKeepVotes.length === 1 ? 's' : ''} it so far)`;
        }

        return {
            type: 'waiting',
            message: `⏳ ${waitingText}`
        };
    }

    return '';
};