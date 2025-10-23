import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Collection references
const USERS_COLLECTION = 'users';
const PROPOSALS_COLLECTION = 'locationProposals';

// ==================== USER PROFILE MANAGEMENT ====================

/**
 * Create a new user profile
 * @param {string} userId - The user's unique ID
 * @param {Object} userData - User profile data
 * @returns {Promise<void>}
 */
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('User profile created successfully');
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Get a user profile by ID
 * @param {string} userId - The user's unique ID
 * @returns {Promise<Object|null>}
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      console.log('User profile not found');
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Update a user profile
 * @param {string} userId - The user's unique ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Delete a user profile
 * @param {string} userId - The user's unique ID
 * @returns {Promise<void>}
 */
export const deleteUserProfile = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
    console.log('User profile deleted successfully');
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};

// ==================== LOCATION PROPOSAL MANAGEMENT ====================

/**
 * Create a new location proposal
 * @param {Object} proposalData - Proposal data including location details
 * @returns {Promise<string>} - The ID of the created proposal
 */
export const createProposal = async (proposalData) => {
  try {
    const proposalsRef = collection(db, PROPOSALS_COLLECTION);
    const docRef = await addDoc(proposalsRef, {
      ...proposalData,
      status: 'pending',
      votes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('Proposal created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }
};

/**
 * Get a proposal by ID
 * @param {string} proposalId - The proposal's unique ID
 * @returns {Promise<Object|null>}
 */
export const getProposal = async (proposalId) => {
  try {
    const proposalRef = doc(db, PROPOSALS_COLLECTION, proposalId);
    const proposalSnap = await getDoc(proposalRef);
    
    if (proposalSnap.exists()) {
      return { id: proposalSnap.id, ...proposalSnap.data() };
    } else {
      console.log('Proposal not found');
      return null;
    }
  } catch (error) {
    console.error('Error getting proposal:', error);
    throw error;
  }
};

/**
 * Get all proposals
 * @param {Object} filters - Optional filters (status, userId, etc.)
 * @returns {Promise<Array>}
 */
export const getProposals = async (filters = {}) => {
  try {
    let proposalsQuery = collection(db, PROPOSALS_COLLECTION);
    
    // Apply filters if provided
    const constraints = [];
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters.userId) {
      constraints.push(where('userId', '==', filters.userId));
    }
    if (filters.orderBy) {
      constraints.push(orderBy(filters.orderBy, filters.order || 'desc'));
    }
    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }
    
    if (constraints.length > 0) {
      proposalsQuery = query(proposalsQuery, ...constraints);
    }
    
    const querySnapshot = await getDocs(proposalsQuery);
    const proposals = [];
    querySnapshot.forEach((doc) => {
      proposals.push({ id: doc.id, ...doc.data() });
    });
    
    return proposals;
  } catch (error) {
    console.error('Error getting proposals:', error);
    throw error;
  }
};

/**
 * Update a proposal
 * @param {string} proposalId - The proposal's unique ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateProposal = async (proposalId, updates) => {
  try {
    const proposalRef = doc(db, PROPOSALS_COLLECTION, proposalId);
    await updateDoc(proposalRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log('Proposal updated successfully');
  } catch (error) {
    console.error('Error updating proposal:', error);
    throw error;
  }
};

/**
 * Delete a proposal
 * @param {string} proposalId - The proposal's unique ID
 * @returns {Promise<void>}
 */
export const deleteProposal = async (proposalId) => {
  try {
    const proposalRef = doc(db, PROPOSALS_COLLECTION, proposalId);
    await deleteDoc(proposalRef);
    console.log('Proposal deleted successfully');
  } catch (error) {
    console.error('Error deleting proposal:', error);
    throw error;
  }
};

/**
 * Vote on a proposal
 * @param {string} proposalId - The proposal's unique ID
 * @param {string} userId - The user's unique ID
 * @param {number} voteValue - Vote value (1 for upvote, -1 for downvote)
 * @returns {Promise<void>}
 */
export const voteOnProposal = async (proposalId, userId, voteValue) => {
  try {
    const proposalRef = doc(db, PROPOSALS_COLLECTION, proposalId);
    const proposalSnap = await getDoc(proposalRef);
    
    if (proposalSnap.exists()) {
      const currentVotes = proposalSnap.data().votes || 0;
      const voters = proposalSnap.data().voters || {};
      
      // Check if user has already voted
      const previousVote = voters[userId] || 0;
      const newVotes = currentVotes - previousVote + voteValue;
      voters[userId] = voteValue;
      
      await updateDoc(proposalRef, {
        votes: newVotes,
        voters: voters,
        updatedAt: serverTimestamp(),
      });
      console.log('Vote recorded successfully');
    }
  } catch (error) {
    console.error('Error voting on proposal:', error);
    throw error;
  }
};

/**
 * Get proposals by location proximity (requires geo queries)
 * @param {Object} location - Location object with lat/lng
 * @param {number} radiusKm - Search radius in kilometers
 * @returns {Promise<Array>}
 */
export const getProposalsByLocation = async (location, radiusKm = 5) => {
  try {
    // Note: For production, use geohash library for proper geo queries
    // This is a simplified version
    const proposals = await getProposals();
    
    // Filter by distance (simplified calculation)
    const filteredProposals = proposals.filter(proposal => {
      if (proposal.location && proposal.location.lat && proposal.location.lng) {
        const distance = calculateDistance(
          location.lat,
          location.lng,
          proposal.location.lat,
          proposal.location.lng
        );
        return distance <= radiusKm;
      }
      return false;
    });
    
    return filteredProposals;
  } catch (error) {
    console.error('Error getting proposals by location:', error);
    throw error;
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
