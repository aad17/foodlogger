
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    Timestamp,
    orderBy,
    deleteDoc,
    doc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { FoodData } from './aiService';

const LOGS_COLLECTION = 'foodLogs';

export const addFoodLog = async (userId: string, foodData: FoodData) => {
    try {
        const docRef = await addDoc(collection(db, 'users', userId, LOGS_COLLECTION), {
            ...foodData,
            timestamp: Timestamp.fromDate(new Date()), // Use server timestamp ideally
            createdAt: Timestamp.now(),
        });
        console.log('Document written with ID: ', docRef.id);
        return docRef.id;
    } catch (e) {
        console.error('Error adding document: ', e);
        throw e;
    }
};

export const deleteFoodLog = async (userId: string, logId: string) => {
    try {
        await deleteDoc(doc(db, 'users', userId, LOGS_COLLECTION, logId));
        console.log('Document deleted with ID: ', logId);
    } catch (e) {
        console.error('Error deleting document: ', e);
        throw e;
    }
};

export const getDailyLogs = async (userId: string, date: Date = new Date()) => {
    try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const q = query(
            collection(db, 'users', userId, LOGS_COLLECTION),
            where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
            where('timestamp', '<=', Timestamp.fromDate(endOfDay)),
            orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const logs: FoodData[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            logs.push({
                ...data,
                id: doc.id,
                // @ts-ignore
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()
            } as FoodData);
        });

        return logs;
    } catch (e) {
        console.error('Error getting documents: ', e);
        return [];
    }
};

export const getWeeklyLogs = async (userId: string): Promise<FoodData[]> => {
    try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6); // Last 7 days including today
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const q = query(
            collection(db, 'users', userId, LOGS_COLLECTION),
            where('timestamp', '>=', Timestamp.fromDate(start)),
            where('timestamp', '<=', Timestamp.fromDate(end)),
            orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const logs: FoodData[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            logs.push({
                ...data,
                id: doc.id,
                // @ts-ignore
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()
            } as FoodData);
        });
        return logs;
    } catch (error) {
        console.error('Error getting weekly logs:', error);
        return [];
    }
};
