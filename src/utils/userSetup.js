import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const initializeUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Initialize missing fields for buyer functionality
      const updates = {};
      
      if (typeof userData.credits === 'undefined') {
        updates.credits = 100; // Starting credits
      }
      
      if (!userData.referralCode) {
        updates.referralCode = generateReferralCode();
      }
      
      if (!userData.transactionHistory) {
        updates.transactionHistory = [];
      }
      
      if (!userData.purchaseHistory) {
        updates.purchaseHistory = [];
      }
      
      if (!userData.totalReferrals) {
        updates.totalReferrals = 0;
      }
      
      if (!userData.creditsFromReferrals) {
        updates.creditsFromReferrals = 0;
      }
      
      if (!userData.pendingReferralCredits) {
        updates.pendingReferralCredits = 0;
      }
      
      if (!userData.referralHistory) {
        updates.referralHistory = [];
      }
      
      if (!userData.contributionHistory) {
        updates.contributionHistory = [];
      }
      
      if (!userData.firstVisit) {
        updates.firstVisit = new Date().toISOString();
      }
      
      // Update user document if there are missing fields
      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
        console.log('User profile initialized with buyer features:', updates);
      }
      
      return { ...userData, ...updates };
    }
    
    return null;
  } catch (error) {
    console.error('Error initializing user profile:', error);
    return null;
  }
};

const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};