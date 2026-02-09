
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Mock function to test the logic in isolation
async function testCalculateNutritionalTargets() {
    const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!API_KEY) {
        console.error("No API KEY found in env");
        return;
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `
      Calculate daily nutritional targets for a person with these stats:
      Gender: Male
      Age: 25
      Height: 180 cm
      Weight: 75 kg
      Activity Level: Moderate
      Goal: Muscle Gain
      
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
        console.log("Sending prompt to Gemini...");
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        console.log("Raw Response:", text);

        const jsonStr = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonStr);
        console.log("Parsed JSON:", data);

        if (data.calories && data.protein && data.water) {
            console.log("✅ Validation SUCCESS: Structure contains expected fields.");
            console.log(`Targets: ${data.calories} kcal, ${data.protein}g protein, ${data.water}ml water`);
        } else {
            console.error("❌ Validation FAILED: Missing fields.");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

testCalculateNutritionalTargets();
