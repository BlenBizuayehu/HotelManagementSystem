
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import { BoxIcon, CalendarIcon, HeartIcon, UsersIcon } from '../constants';
import { generateWelcomeMessage } from '../services/geminiService';
import { useAppContext } from '../state/AppContext';
import { StatCardData } from '../types';

const StatCard: React.FC<{ data: StatCardData }> = ({ data }) => (
  <Card className="p-6 flex items-center">
    <div className={`p-4 bg-gray-100 dark:bg-gray-700 rounded-full ${data.color}`}>
      <data.icon className="h-8 w-8" />
    </div>
    <div className="ml-4">
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{data.title}</p>
      <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{data.value}</p>
    </div>
  </Card>
);

const Dashboard: React.FC = () => {
    const [welcomeMessage, setWelcomeMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { bookings, inventory, spaGymAppointments } = useAppContext();

    const dynamicStats = useMemo<StatCardData[]>(() => {
        const today = new Date().toISOString().split('T')[0];
        return [
            { title: 'Today\'s Check-ins', value: bookings.filter(b => b.checkIn === today && b.status === 'Confirmed').length.toString(), icon: CalendarIcon, color: 'text-blue-500 dark:text-blue-400' },
            { title: 'Room Occupancy', value: `${bookings.filter(b => b.itemType === 'Room' && b.status === 'Confirmed').length} Rooms`, icon: UsersIcon, color: 'text-green-500 dark:text-green-400' },
            { title: 'Low Stock Items', value: inventory.filter(i => i.status === 'Low Stock').length.toString(), icon: BoxIcon, color: 'text-yellow-500 dark:text-yellow-400' },
            { title: 'Spa Appointments Today', value: spaGymAppointments.filter(a => a.status === 'Confirmed').length.toString(), icon: HeartIcon, color: 'text-pink-500 dark:text-pink-400' },
        ];
    }, [bookings, inventory, spaGymAppointments]);


    const fetchWelcomeMessage = useCallback(async () => {
        setIsLoading(true);
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const specialEvents = ['Happy Hour at the rooftop bar (5-7 PM)', 'Live Jazz in the lobby'];
        const message = await generateWelcomeMessage('The Elysian Hotel', today, specialEvents);
        setWelcomeMessage(message);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchWelcomeMessage();
    }, [fetchWelcomeMessage]);

    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8">Dashboard</h1>

            <Card className="mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8">
                 <h2 className="text-2xl font-bold mb-4">Today's Welcome Message</h2>
                {isLoading ? (
                    <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-blue-400 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-blue-400 rounded"></div><div className="h-4 bg-blue-400 rounded w-5/6"></div></div></div></div>
                ) : (
                    <p className="text-lg leading-relaxed">{welcomeMessage}</p>
                )}
                <button 
                    onClick={fetchWelcomeMessage} 
                    disabled={isLoading}
                    className="mt-4 bg-white text-blue-600 font-semibold py-2 px-5 rounded-lg hover:bg-gray-100 transition duration-300 disabled:opacity-50"
                >
                    {isLoading ? 'Generating...' : 'Regenerate'}
                </button>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {dynamicStats.map(stat => <StatCard key={stat.title} data={stat} />)}
            </div>

            <div>
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Recent Bookings</h2>
                 <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Guest</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Item</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Dates</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.slice(0, 5).map((booking) => (
                                    <tr key={booking._id} className="border-b dark:border-gray-700">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">{booking.guestName}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{booking.guestEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                             <div className="font-medium text-gray-900 dark:text-gray-100">{booking.itemName}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{booking.itemType}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{booking.checkIn ? `${booking.checkIn} to ${booking.checkOut}`: 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                booking.status === 'Confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                                'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </Card>
            </div>
        </div>
    );
};

export default Dashboard;