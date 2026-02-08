require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const IMAGE_PATH = path.join(__dirname, '../download.jpeg');

async function testGemini() {
    console.log('--- Starting AI Test ---');

    if (!API_KEY) {
        console.error('❌ Error: EXPO_PUBLIC_GEMINI_API_KEY not found in environment');
        process.exit(1);
    }
    console.log('✅ API Key found');

    if (!fs.existsSync(IMAGE_PATH)) {
        console.error(`❌ Error: Image not found at ${IMAGE_PATH}`);
        process.exit(1);
    }
    console.log('✅ Image file found');

    try {
        // Init Gemini
        const genAI = new GoogleGenerativeAI(API_KEY);
        // Using 'gemini-flash-latest' as confirmed by API list
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        // Prepare Image
        const imageBuffer = fs.readFileSync(IMAGE_PATH);
        const base64Image = imageBuffer.toString('base64');

        console.log(`📸 Image loaded (${imageBuffer.length} bytes)`);

        // Prompt (Exact copy from aiService.ts)
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

        console.log('🚀 Sending request to Gemini...');
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: 'image/jpeg',
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        console.log('\n--- 🤖 AI Response ---');
        console.log(text);
        console.log('----------------------\n');

        // Validation
        try {
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(jsonStr);
            console.log('✅ Valid JSON received!');
            console.log(`Food: ${data.foodName}`);
            console.log(`Calories: ${data.calories}`);
            console.log(`Macros: P:${data.macros.protein} C:${data.macros.carbs} F:${data.macros.fat}`);
            if (data.micros) {
                console.log('✅ Micros present:', Object.keys(data.micros).join(', '));
            } else {
                console.warn('⚠️ No micros found in JSON');
            }
        } catch (e) {
            console.error('❌ Failed to parse JSON response:', e.message);
        }

    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
}

testGemini();
