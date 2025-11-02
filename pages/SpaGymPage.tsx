
import React from 'react';
import Card from '../components/Card';
import { useAppContext } from '../state/AppContext';

const SpaGymPage: React.FC = () => {
    const { spaGymAppointments, updateSpaGymAppointmentStatus } = useAppContext();

    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8">Spa & Gym Management</h1>
             <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Service</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Guest</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Time</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {spaGymAppointments.length > 0 ? spaGymAppointments.map((appt) => (
                                <tr key={appt._id} className="border-b dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{appt.service}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{appt.guestName}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{appt.time}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            appt.status === 'Confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                                        }`}>
                                            {appt.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {appt.status === 'Confirmed' && (
                                            <button onClick={() => updateSpaGymAppointmentStatus(appt._id, 'Completed')} className="text-purple-600 hover:underline font-semibold dark:text-purple-400">
                                                Mark as Completed
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">No appointments found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
export default SpaGymPage;