import { GoogleGenerativeAI } from '@google/generative-ai';
// Use legacy API to avoid deprecation warnings/errors with readAsStringAsync
import * as FileSystem from 'expo-file-system/legacy';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export interface FoodData {
    foodName: string;
    calories: number;
    macros: {
        protein: number;
        carbs: number;
        fat: number;
    };
    micros?: {
        [key: string]: string | number;
    };
    category: 'Breakfast' | 'Morning Snack' | 'Lunch' | 'Evening Snack' | 'Dinner';
    timestamp: string;
    confidence: number;
    imageUri?: string;
    id?: string;
    // New Fields
    isFood: boolean;
    healthScore: number; // 0-100
    healthScoreReason?: string;
    quantity: number; // Default 1
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const analyzeImage = async (uri: string): Promise<FoodData> => {
    if (!genAI) {
        console.warn('Gemini API Key not found. Returning mock data.');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
            foodName: 'Mock Avocado Toast',
            calories: 320,
            macros: { protein: 12, carbs: 45, fat: 18 },
            micros: { 'Vitamin E': '14%' },
            category: 'Breakfast',
            timestamp: new Date().toISOString(),
            confidence: 0.9,
            isFood: true,
            healthScore: 85,
            healthScoreReason: 'High in healthy fats and fiber.',
            quantity: 1,
        };
    }

    try {
        console.log(`[aiService] Analyzing URI: ${uri}`);
        let base64 = '';
        if (uri.startsWith('data:image')) {
            console.log('[aiService] URI is data-uri');
            base64 = uri.split(',')[1];
        } else {
            console.log('[aiService] Reading file from FS...');
            try {
                base64 = await FileSystem.readAsStringAsync(uri, {
                    encoding: 'base64',
                });
                console.log(`[aiService] Read success. Base64 length: ${base64.length}`);
            } catch (fsError) {
                console.error('[aiService] FileSystem Read Error:', fsError);
                throw new Error('Failed to read image file');
            }
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `
      Analyze this image.
      First, determine if it contains food.
      If it represents food, extract nutritional information.
      
      Return ONLY a valid JSON object with this exact structure:
      {
        "isFood": boolean,
        "foodName": "string",
        "calories": number,
        "macros": {
          "protein": number,
          "carbs": number,
          "fat": number
        },
        "micros": {
          "Vitamin A": "string",
          "Vitamin C": "string",
          "Calcium": "string",
          "Iron": "string"
        },
        "category": "Breakfast" | "Morning Snack" | "Lunch" | "Evening Snack" | "Dinner",
        "confidence": number (0-1),
        "healthScore": number (0-100),
        "healthScoreReason": "string (brief explanation why)",
        "quantity": number (Estimate the count or serving size, default to 1 if one portion)
      }

      If "isFood" is false, you can set the other fields to null or appropriate defaults, but the JSON must still be valid.
      
      For Health Score: 0 is very unhealthy (processed, high sugar/trans fat), 100 is very healthy (whole food, balanced).
      Estimate the portion size visible.
      Choose the category based on the type of food and typical meal times.
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64,
                    mimeType: 'image/jpeg', // Assuming JPEG for now, could detect from URI
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        // ... existing code



        return {
            ...data,
            // Ensure defaults if AI misses them
            isFood: data.isFood !== undefined ? data.isFood : true,
            quantity: data.quantity || 1,
            healthScore: data.healthScore || 50,
            timestamp: new Date().toISOString(),
        };

    } catch (error) {
        console.error('Error analyzing image with Gemini:', error);
        // @ts-ignore
        if (error.response) {
            // @ts-ignore
            console.error('API Response Error:', error.response);
        }
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        throw error;
    }
};

export const calculateNutritionalTargets = async (
    age: number,
    gender: string,
    height: number,
    weight: number,
    activityLevel: string,
    goal: string
) => {
    // If genAI is null, we can try to re-init it or just fail gracefully/mock.
    // Since genAI is top-level const, we can access it.
    if (!genAI) {
        console.warn('Gemini API Key not found. Returning default targets.');
        return { calories: 2000, protein: 150, carbs: 200, fat: 65, water: 2500 };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `
      Calculate daily nutritional targets for a person with these stats:
      Gender: ${gender}
      Age: ${age}
      Height: ${height} cm
      Weight: ${weight} kg
      Activity Level: ${activityLevel}
      Goal: ${goal}
      
      Return ONLY a valid JSON object:
      {
        "calories": number,
        "protein": number (grams),
        "carbs": number (grams),
        "fat": number (grams),
        "water": number (ml, rough recommendation)
      }
      Do not include markdown formatting like \`\`\`json.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI Calculation Error:", error);
        return {
            calories: 2000,
            protein: 150,
            carbs: 200,
            fat: 65,
            water: 2500
        };
    }
};
