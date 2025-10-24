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
const APPROVED_COLLECTION = 'approvedLocations';

// ==================== USER PROFILE MANAGEMENT ====================
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

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const deleteUserProfile = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};

// ==================== LOCATION PROPOSAL MANAGEMENT ====================
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

export const getProposal = async (proposalId) => {
  try {
    const proposalRef = doc(db, PROPOSALS_COLLECTION, proposalId);
    const proposalSnap = await getDoc(proposalRef);
    if (proposalSnap.exists()) {
      return { id: proposalSnap.id, ...proposalSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting proposal:', error);
    throw error;
  }
};

export const getProposals = async (filters = {}) => {
  try {
    let proposalsQuery = collection(db, PROPOSALS_COLLECTION);
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
    querySnapshot.forEach((d) => {
      proposals.push({ id: d.id, ...d.data() });
    });
    return proposals;
  } catch (error) {
    console.error('Error getting proposals:', error);
    throw error;
  }
};

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

export const voteOnProposal = async (proposalId, userId, voteValue) => {
  try {
    const proposalRef = doc(db, PROPOSALS_COLLECTION, proposalId);
    const proposalSnap = await getDoc(proposalRef);
    if (proposalSnap.exists()) {
      const currentVotes = proposalSnap.data().votes || 0;
      const voters = proposalSnap.data().voters || {};
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
