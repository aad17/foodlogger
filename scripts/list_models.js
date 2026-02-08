require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

async function listModels() {
    if (!API_KEY) {
        console.error('API Key missing');
        return;
    }
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Note: listModels is on the genAI instance or model manager?
    // Based on docs for @google/generative-ai:
    // It seems there isn't a direct listModels on the high-level client in some versions,
    // but let's try to access the underlying API or just try a standard one like 'gemini-pro'.

    // Actually, 'gemini-1.5-flash' SHOULD be correct for v1beta.
    // The error "models/gemini-1.5-flash is not found for API version v1beta" is very specific.
    // It might be that the user has access to 'gemini-pro' but not flash?

    console.log('Testing gemini-pro...');
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent('Hello');
        console.log('gemini-pro works!');
    } catch (e) {
        console.log('gemini-pro failed:', e.message);
    }

    console.log('Testing gemini-1.5-flash-001...');
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });
        const result = await model.generateContent('Hello');
        console.log('gemini-1.5-flash-001 works!');
    } catch (e) {
        console.log('gemini-1.5-flash-001 failed:', e.message);
    }
}

listModels();
