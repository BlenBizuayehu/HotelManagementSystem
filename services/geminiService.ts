
const mode = (import.meta as any).env.MODE;
const API_BASE_URL =
  mode === "production"
    ? "https://hotelmanagementsystem-1-1ozu.onrender.com/api"
    : "http://127.0.0.1:5000/api";
const API_URL = `${API_BASE_URL}/gemini`;

export const generateWelcomeMessage = async (hotelName: string, date: string, specialEvents: string[]): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelName, date, specialEvents }),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error fetching welcome message from backend:", error);
    return `Welcome to ${hotelName}! We're thrilled to have you with us today, ${date}. Enjoy our world-class amenities and have a wonderful stay. Today's events include: ${specialEvents.join(', ')}.`;
  }
};


export const generateAdminInsight = async (prompt: string, contextData: object): Promise<string> => {
    try {
        const response = await fetch(`${API_URL}/insight`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, contextData }),
        });
        if (!response.ok) {
             const err = await response.json();
             throw new Error(err.message || 'Failed to get insight');
        }
        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Error fetching admin insight from backend:", error);
        return "I'm sorry, I encountered an error while analyzing the data. Please ensure the backend server is running and try again.";
    }
}