
const { GoogleGenAI } = require("@google/genai");

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

exports.getWelcomeMessage = async (req, res) => {
  try {
    const { hotelName, date, specialEvents } = req.body;
    const prompt = `Generate a warm and welcoming daily message for guests at "${hotelName}" for ${date}. 
    The tone should be luxurious, friendly, and informative. 
    Mention the following special events or notes for today: ${specialEvents.join(', ')}. 
    Keep it concise, under 100 words.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Error generating welcome message with Gemini:", error);
    res.status(500).json({ message: "Failed to generate welcome message." });
  }
};

exports.getAdminInsight = async (req, res) => {
    try {
        const { prompt, contextData } = req.body;
        const fullPrompt = `
        You are an AI assistant for the "Elysian Hotel" management team. 
        Analyze the following data and answer the user's question. 
        Provide clear, concise, and actionable insights. Be friendly and professional.

        Current Hotel Data:
        ${JSON.stringify(contextData, null, 2)}

        User's Question: "${prompt}"
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });
        
        res.json({ text: response.text });
    } catch (error) {
        console.error("Error generating admin insight with Gemini:", error);
        res.status(500).json({ message: "I'm sorry, I encountered an error while analyzing the data." });
    }
};
