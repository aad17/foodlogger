require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

async function testFirestore() {
    console.log('--- Testing Firestore Connection ---');
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        console.log('Attempting to write to "test_collection"...');
        const docRef = await addDoc(collection(db, 'test_collection'), {
            test: true,
            createdAt: new Date()
        });

        console.log('✅ Success! Document written with ID: ', docRef.id);
    } catch (e) {
        console.error('❌ Firestore Error:', e.message);
        if (e.message.includes('not found')) {
            console.log('\n>>> DIAGNOSIS: The Firestore Database has not been created in the Firebase Console.');
        }
    }
}

testFirestore();
