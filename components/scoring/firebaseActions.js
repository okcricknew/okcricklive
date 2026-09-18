import { db } from '../../lib/firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

/**
 * Updates match score and ball history atomically.
 * @param {string} tId - Tournament ID
 * @param {string} mId - Match ID
 * @param {object} updates - Numeric/Status updates (increment, direct values)
 * @param {object} ballLog - The log object for the current delivery
 */
export const updateMatchScore = async (tId, mId, updates, ballLog) => {
  // 1. Critical Validation: Ensure IDs exist to prevent undefined path errors
  if (!tId || !mId) {
    console.error("Firebase Update Aborted: Missing tId or mId");
    return false;
  }

  try {
    const matchRef = doc(db, 'tournaments', tId, 'matches', mId);
    
    // 2. Prepare final update object
    // Adding serverTimestamp ensures we know exactly when the last change happened
    let finalUpdates = { 
      ...updates,
      updatedAt: serverTimestamp(),
lastUpdatedLocal: new Date().toISOString() 
      
    };

    // 3. Atomically add ball log to history if provided
    if (ballLog) {
      // We use arrayUnion to prevent overwriting the existing history array
      finalUpdates.ballHistory = arrayUnion({
        ...ballLog,
        // Optional: Local timestamp for backup tracking
        clientTime: new Date().toISOString()
      });
    }

    // 4. Perform the update
    updateDoc(matchRef, finalUpdates).catch(err => console.error("Sync Error:", err));
    
    return true; 
  } catch (error) {
    // 5. Error Handling: Re-throwing allows the UI (useScoringLogic) 
    // to stop the 'isProcessing' spinner and show an error alert.
    console.error("Firebase Update Error for Match:", mId, error);
    throw error;
  }
};
