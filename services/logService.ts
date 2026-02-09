import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';

const WEIGHT_COLLECTION = 'weight_logs';
const WATER_COLLECTION = 'water_logs';

export interface WeightLog {
    id?: string; // Optional because it's added by Firestore
    uid: string;
    weight: number;
    timestamp: string; // ISO string
}

export interface WaterLog {
    id?: string;
    uid: string;
    amount: number; // ml
    timestamp: string; // ISO string
}

// --- Weight ---

export const addWeightLog = async (uid: string, weight: number, date: Date = new Date()) => {
    try {
        await addDoc(collection(db, 'users', uid, WEIGHT_COLLECTION), {
            uid,
            weight,
            timestamp: date.toISOString()
        });
    } catch (e) {
        console.error("Error adding weight log:", e);
        throw e;
    }
};

export const getWeightLogs = async (uid: string, days: number = 30): Promise<WeightLog[]> => {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const q = query(
            collection(db, 'users', uid, WEIGHT_COLLECTION),
            where('timestamp', '>=', startDate.toISOString()),
            orderBy('timestamp', 'asc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeightLog));
    } catch (e) {
        console.error("Error fetching weight logs:", e);
        return [];
    }
};

// --- Water ---

export const addWaterLog = async (uid: string, amount: number) => {
    try {
        await addDoc(collection(db, 'users', uid, WATER_COLLECTION), {
            uid,
            amount,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        console.error("Error adding water log:", e);
        throw e;
    }
};

export const getDailyWaterLogs = async (uid: string, date: Date = new Date()): Promise<WaterLog[]> => {
    try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const q = query(
            collection(db, 'users', uid, WATER_COLLECTION),
            where('timestamp', '>=', startOfDay.toISOString()),
            where('timestamp', '<=', endOfDay.toISOString()),
            orderBy('timestamp', 'asc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WaterLog));
    } catch (e) {
        console.error("Error fetching water logs:", e);
        return [];
    }
};
