
import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import { useAppContext } from '../state/AppContext';
import { Booking } from '../types';

const BookingsPage: React.FC = () => {
    const { bookings, updateBookingStatus } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleStatusChange = (id: string, newStatus: Booking['status']) => {
        if (newStatus === 'Cancelled') {
            if (confirm('Are you sure you want to cancel this booking?')) {
                 updateBookingStatus(id, newStatus);
            }
        } else {
            updateBookingStatus(id, newStatus);
        }
    };

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => 
            booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.itemName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [bookings, searchTerm]);

    return (
        <div className="p-8">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Bookings Management</h1>
                <input 
                    type="text"
                    placeholder="Search by guest or item..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Guest</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Item Booked</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Dates</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
                                <tr key={booking._id} className="border-b dark:border-gray-700">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{booking.guestName}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{booking.guestEmail}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{booking.guestPhone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{booking.itemName}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{booking.itemType}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{booking.checkIn ? `${booking.checkIn} to ${booking.checkOut}` : 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                                            booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                            'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        {booking.status === 'Pending' && (
                                            <button onClick={() => handleStatusChange(booking._id, 'Confirmed')} className="text-green-600 hover:underline font-semibold dark:text-green-400">Confirm</button>
                                        )}
                                        {booking.status !== 'Cancelled' && (
                                             <button onClick={() => handleStatusChange(booking._id, 'Cancelled')} className="text-red-600 hover:underline font-semibold dark:text-red-400">Cancel</button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">No bookings found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default BookingsPage;