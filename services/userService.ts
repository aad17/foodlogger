import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface UserProfile {
    uid: string;
    gender: 'Male' | 'Female' | 'Other';
    age: number;
    height: number; // cm
    weight: number; // kg
    activityLevel: 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Very Active';
    goal: 'Weight Loss' | 'Maintenance' | 'Muscle Gain';
    targets?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        water: number; // ml
    };
    createdAt: number;
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
};

export const createUserProfile = async (profile: UserProfile): Promise<void> => {
    try {
        await setDoc(doc(db, 'users', profile.uid), profile);
    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'users', uid), updates);
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};
