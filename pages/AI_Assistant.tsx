
import React, { useState } from 'react';
import Card from '../components/Card';
import { SparklesIcon, UsersIcon } from '../constants';
import { generateAdminInsight } from '../services/geminiService';
import { useAppContext } from '../state/AppContext';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const AI_Assistant: React.FC = () => {
    const { rooms, bookings, employees, inventory, spaGymAppointments, schedules } = useAppContext();
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: "Hello! I'm your AI Assistant. How can I help you manage The Elysian Hotel today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const contextData = { rooms, bookings, employees, inventory, spaGymAppointments, schedules };
        const aiResponse = await generateAdminInsight(input, contextData);

        const aiMessage: Message = { sender: 'ai', text: aiResponse };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };
    
    const handlePresetQuery = (query: string) => {
        setInput(query);
    }
    
    const presetButtonClasses = "p-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-sm text-gray-700 dark:text-gray-300 transition-colors";

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex items-center mb-8">
                <SparklesIcon className="h-10 w-10 text-blue-600 mr-4" />
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">AI Assistant</h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                 <button onClick={() => handlePresetQuery("Summarize today's check-ins and check-outs.")} className={presetButtonClasses}>Summarize today's activity</button>
                 <button onClick={() => handlePresetQuery("Which inventory items are low on stock?")} className={presetButtonClasses}>Check inventory status</button>
                 <button onClick={() => handlePresetQuery("Who is scheduled to work the evening shift today?")} className={presetButtonClasses}>View today's schedule</button>
                 <button onClick={() => handlePresetQuery("Which is our most expensive room?")} className={presetButtonClasses}>Analyze room pricing</button>
            </div>

            <Card className="flex-grow flex flex-col">
                <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white"><SparklesIcon className="h-6 w-6"/></div>}
                            <div className={`p-4 rounded-2xl max-w-lg ${msg.sender === 'ai' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 'bg-blue-600 text-white'}`}>
                                <p style={{whiteSpace: 'pre-wrap'}}>{msg.text}</p>
                            </div>
                            {msg.sender === 'user' && <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white"><UsersIcon className="h-6 w-6"/></div>}
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white"><SparklesIcon className="h-6 w-6"/></div>
                            <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-800">
                                <div className="animate-pulse flex space-x-2">
                                    <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                                    <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                                    <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t bg-white dark:bg-gray-800 dark:border-gray-700 rounded-b-xl">
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                            placeholder="Ask me anything about the hotel..."
                            className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading} className="ml-4 bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-300">
                            Send
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AI_Assistant;