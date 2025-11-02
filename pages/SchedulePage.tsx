
import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useAppContext } from '../state/AppContext';
import { Schedule } from '../types';

const SchedulePage: React.FC = () => {
    const { schedules, employees, addSchedule } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const filteredSchedules = useMemo(() => {
        return schedules.filter(s => s.date === selectedDate).sort((a,b) => a.shift.localeCompare(b.shift));
    }, [schedules, selectedDate]);

    const AddScheduleForm: React.FC<{onSave: (data: any) => void}> = ({onSave}) => {
        // Fix: Changed employeeId state to be a string.
        const [employeeId, setEmployeeId] = useState<string>('');
        const [date, setDate] = useState(selectedDate);
        const [shift, setShift] = useState<Schedule['shift']>('Morning (9AM-5PM)');
        
        const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200";
        const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";


        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if(!employeeId) {
                alert("Please select an employee.");
                return;
            }
            onSave({employeeId, date, shift});
        }

        return (
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                     <div>
                        <label className={labelClasses}>Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} required/>
                    </div>
                    <div>
                        <label className={labelClasses}>Employee</label>
                        <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} className={inputClasses} required>
                           <option value="">Select an employee</option>
                           {employees.filter(e => e.status === 'Active').map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClasses}>Shift</label>
                        <select value={shift} onChange={e => setShift(e.target.value as Schedule['shift'])} className={inputClasses} required>
                            <option>Morning (9AM-5PM)</option>
                            <option>Evening (3PM-11PM)</option>
                            <option>Night (11PM-7AM)</option>
                        </select>
                    </div>
                </div>
                 <div className="mt-6 flex justify-end">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                        Add to Schedule
                    </button>
                </div>
            </form>
        )
    }

    return (
        <div className="p-8">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Employee Schedules</h1>
                <div className="flex items-center gap-4">
                     <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 p-2 border border-gray-300 rounded-lg shadow-sm" />
                    <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-300">
                        Add Schedule
                    </button>
                </div>
            </div>
            
             <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">Schedule for {new Date(selectedDate).toDateString()}</h2>

             <Card>
                <div className="overflow-x-auto">
                    {filteredSchedules.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Employee</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Shift</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSchedules.map((schedule) => (
                                    <tr key={schedule._id} className="border-b dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{schedule.employeeId?.name || 'Unknown Employee'}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{schedule.shift}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="p-8 text-center text-gray-500 dark:text-gray-400">No shifts scheduled for this date.</p>
                    )}
                </div>
            </Card>

             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Schedule">
                <AddScheduleForm onSave={(data) => {
                    addSchedule(data);
                    setIsModalOpen(false);
                }}/>
            </Modal>
        </div>
    );
};

export default SchedulePage;