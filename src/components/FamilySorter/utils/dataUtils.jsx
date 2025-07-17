import { db } from '../../../contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';

console.log('Using shared authenticated Firebase connection');

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

// Data persistence functions using shared authenticated Firebase
export const saveItems = async (items, itemIdCounter) => {
    try {
        const docRef = doc(db, 'family-data', 'items');
        await setDoc(docRef, {
            items: items,
            itemIdCounter: itemIdCounter,
            lastUpdated: new Date().toISOString()
        });
        console.log('Data saved to Firebase successfully with authentication');
    } catch (error) {
        console.error('Error saving to Firebase:', error);
        alert('Failed to save data. Please make sure you are logged in and try again.');
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
            console.log('Data loaded from Firebase successfully with authentication');
        } else {
            console.log('No data found, starting fresh');
            setItems([]);
            setItemIdCounter(0);
        }
    } catch (error) {
        console.error('Error loading from Firebase:', error);
        alert('Failed to load data. Please make sure you are logged in and try again.');
        setItems([]);
        setItemIdCounter(0);
    }
};

// Vote analysis utilities - Laura excluded from analytics
export const getStatusIndicator = (item) => {
    const activeFamilyMembers = ['alexander', 'celestin', 'do-rachelle']; // Laura excluded
    const totalActiveMembers = activeFamilyMembers.length;

    if (!item.votes || Object.keys(item.votes).length === 0) return '';

    // Only count votes from active members
    const activeVotes = {};
    activeFamilyMembers.forEach(member => {
        if (item.votes[member]) {
            activeVotes[member] = item.votes[member];
        }
    });

    const activeVoteValues = Object.values(activeVotes);
    const allVoted = activeVoteValues.length === totalActiveMembers;

    if (allVoted) {
        const keepVotes = [];
        activeFamilyMembers.forEach(member => {
            if (activeVotes[member] === 'keep') {
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
            activeVoteValues.forEach(vote => {
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
                    const voteText = voteCount === totalActiveMembers ? 'unanimous' : `${voteCount}/${totalActiveMembers} votes`;
                    return {
                        type: 'success',
                        message: `✅ ${choiceText} (${voteText})`
                    };
                }
            } else {
                const tiedChoices = majorityChoices.map(([choice]) => 
                    ({ charity: 'charity', sell: 'sell', trash: 'trash' }[choice])
                ).filter(Boolean);

                return {
                    type: 'conflict',
                    message: `⚠️ Tied vote: ${tiedChoices.join(' vs ')} - family discussion needed`
                };
            }
        }
    } else {
        const remainingVoters = activeFamilyMembers.filter(member => !activeVotes[member]);
        const remainingNames = remainingVoters.map(member =>
            member.charAt(0).toUpperCase() + member.slice(1).replace('-', '-')
        );

        const currentKeepVotes = [];
        activeFamilyMembers.forEach(member => {
            if (activeVotes[member] === 'keep') {
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