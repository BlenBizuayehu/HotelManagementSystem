import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useAppContext } from '../state/AppContext';
import { Shift } from '../types';

const ShiftsPage: React.FC = () => {
    const { addNotification, getAuthHeaders, API_BASE_URL } = useAppContext();
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [filterActive, setFilterActive] = useState<boolean | null>(null);

    useEffect(() => {
        fetchShifts();
    }, [filterActive]);

    const fetchShifts = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            const queryParam = filterActive !== null ? `?isActive=${filterActive}` : '';
            const response = await fetch(`${API_BASE_URL}/shifts${queryParam}`, { headers });
            if (!response.ok) throw new Error('Failed to fetch shifts');
            const data = await response.json();
            setShifts(data);
        } catch (error: any) {
            addNotification(error.message || 'Failed to load shifts', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingShift(null);
        setIsModalOpen(true);
    };

    const openEditModal = (shift: Shift) => {
        setEditingShift(shift);
        setIsModalOpen(true);
    };

    const openDeleteDialog = (id: string) => {
        setSelectedShiftId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedShiftId) return;
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/shifts/${selectedShiftId}`, {
                method: 'DELETE',
                headers
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete shift');
            }
            addNotification('Shift deleted successfully', 'success');
            setIsDeleteDialogOpen(false);
            setSelectedShiftId(null);
            fetchShifts();
        } catch (error: any) {
            addNotification(error.message || 'Failed to delete shift', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time24: string) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingShift(null);
    };

    const ShiftForm: React.FC<{ shift: Shift | null, onSave: (shiftData: any) => void, onCancel: () => void }> = ({ shift, onSave, onCancel }) => {
        const [name, setName] = useState(shift?.name || '');
        const [startTime, setStartTime] = useState(shift?.startTime || '09:00');
        const [endTime, setEndTime] = useState(shift?.endTime || '17:00');
        const [description, setDescription] = useState(shift?.description || '');
        const [isActive, setIsActive] = useState(shift?.isActive !== undefined ? shift.isActive : true);
        const [color, setColor] = useState(shift?.color || '#3B82F6');
        const [daysOfWeek, setDaysOfWeek] = useState<string[]>(shift?.daysOfWeek || []);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const shiftData = {
                _id: shift?._id,
                name,
                startTime,
                endTime,
                description,
                isActive,
                color,
                daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : undefined
            };
            onSave(shiftData);
        };

        const toggleDay = (day: string) => {
            setDaysOfWeek(prev =>
                prev.includes(day)
                    ? prev.filter(d => d !== day)
                    : [...prev, day]
            );
        };

        const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200";

        return (
            <form onSubmit={handleSubmit}>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shift Name *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time *</label>
                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClasses} required />
                            <p className="text-xs text-gray-500 mt-1">24-hour format (HH:MM)</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time *</label>
                            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClasses} required />
                            <p className="text-xs text-gray-500 mt-1">24-hour format (HH:MM)</p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className={inputClasses} rows={2} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Days of Week (Optional - leave empty for all days)</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                <label key={day} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={daysOfWeek.includes(day)}
                                        onChange={() => toggleDay(day)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{day.substring(0, 3)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                            <input type="color" value={color} onChange={e => setColor(e.target.value)} className={inputClasses} />
                        </div>
                        <div>
                            <label className="flex items-center space-x-2 cursor-pointer mt-6">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={e => setIsActive(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg transition duration-300 dark:bg-gray-600 dark:text-gray-200">Cancel</button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                        {shift ? 'Update Shift' : 'Create Shift'}
                    </button>
                </div>
            </form>
        );
    };

    const handleSave = async (shiftData: any) => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            const method = shiftData._id ? 'PUT' : 'POST';
            const url = shiftData._id ? `${API_BASE_URL}/shifts/${shiftData._id}` : `${API_BASE_URL}/shifts`;
            
            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(shiftData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save shift');
            }

            addNotification(shiftData._id ? 'Shift updated successfully' : 'Shift created successfully', 'success');
            closeModal();
            fetchShifts();
        } catch (error: any) {
            addNotification(error.message || 'Failed to save shift', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredShifts = shifts.filter(shift => {
        if (filterActive === null) return true;
        return shift.isActive === filterActive;
    });

    return (
        <div className="p-8">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Shift Management</h1>
                <div className="flex items-center gap-4">
                    <select
                        value={filterActive === null ? 'all' : filterActive.toString()}
                        onChange={e => setFilterActive(e.target.value === 'all' ? null : e.target.value === 'true')}
                        className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    >
                        <option value="all">All Shifts</option>
                        <option value="true">Active Only</option>
                        <option value="false">Inactive Only</option>
                    </select>
                    <button onClick={openAddModal} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-300 whitespace-nowrap">
                        + Add Shift
                    </button>
                </div>
            </div>

            <Card>
                {loading && !shifts.length ? (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading shifts...</div>
                ) : filteredShifts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredShifts.map((shift) => (
                            <div
                                key={shift._id}
                                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                                style={{ borderLeftColor: shift.color, borderLeftWidth: '4px' }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{shift.name}</h3>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                        shift.isActive
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                    }`}>
                                        {shift.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                </p>
                                {shift.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{shift.description}</p>
                                )}
                                {shift.daysOfWeek && shift.daysOfWeek.length > 0 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        Days: {shift.daysOfWeek.join(', ')}
                                    </p>
                                )}
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => openEditModal(shift)}
                                        className="flex-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold py-2 px-4 rounded transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openDeleteDialog(shift._id)}
                                        className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold py-2 px-4 rounded transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">No shifts found. Create your first shift to get started.</div>
                )}
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingShift ? "Edit Shift" : "Add New Shift"}>
                <ShiftForm
                    shift={editingShift}
                    onCancel={closeModal}
                    onSave={handleSave}
                />
            </Modal>

            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                title="Delete Shift"
                message="Are you sure you want to delete this shift? This action cannot be undone if employees are assigned to it."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
                onCancel={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedShiftId(null);
                }}
                variant="danger"
            />
        </div>
    );
};

export default ShiftsPage;
