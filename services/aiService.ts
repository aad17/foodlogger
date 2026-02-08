
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';

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
    category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    timestamp: string;
    confidence: number;
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
        };
    }

    try {
        let base64 = '';
        if (uri.startsWith('data:image')) {
            base64 = uri.split(',')[1];
        } else {
            base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `
      Analyze this food image and provide nutritional information.
      Return ONLY a valid JSON object with this exact structure:
      {
        "foodName": "string",
        "calories": number,
        "macros": {
          "protein": number,
          "carbs": number,
          "fat": number
        },
        "micros": {
          "Vitamin A": "string (e.g. 10% DV)",
          "Vitamin C": "string",
          "Calcium": "string",
          "Iron": "string"
        },
        "category": "Breakfast" | "Lunch" | "Dinner" | "Snack",
        "confidence": number (0-1)
      }
      Estimate the portion size visible. If unsure, make a best guess based on standard serving sizes.
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

        return {
            ...data,
            timestamp: new Date().toISOString(),
        };

    } catch (error) {
        console.error('Error analyzing image with Gemini:', error);
        throw error;
    }
};
