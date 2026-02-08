
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    Timestamp,
    orderBy
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
            logs.push(doc.data() as FoodData);
        });

        return logs;
    } catch (e) {
        console.error('Error getting documents: ', e);
        return [];
    }
};

export const getWeeklyStats = async (userId: string) => {
    // Placeholder for weekly stats logic
    // In a real app, you might aggregate this on write or use a cloud function
    // For now, we can fetch last 7 days logs
    const now = new Date();
    const past7Days = new Date();
    past7Days.setDate(now.getDate() - 7);

    const q = query(
        collection(db, 'users', userId, LOGS_COLLECTION),
        where('timestamp', '>=', Timestamp.fromDate(past7Days)),
        orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    // Process logs to group by day...
    // Returning raw logs for now to be processed by component
    const logs: any[] = [];
    querySnapshot.forEach((doc) => {
        logs.push({ ...doc.data(), id: doc.id });
    });
    return logs;
};
