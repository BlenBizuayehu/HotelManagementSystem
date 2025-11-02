
import React, { useState } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useAppContext } from '../state/AppContext';
import { Room } from '../types';

const RoomsPage: React.FC = () => {
    const { rooms, addRoom, updateRoom, deleteRoom } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    const openAddModal = () => {
        setEditingRoom(null);
        setIsModalOpen(true);
    };

    const openEditModal = (room: Room) => {
        setEditingRoom(room);
        setIsModalOpen(true);
    };

    // Fix: Changed id type from number to string to match data model.
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
            deleteRoom(id);
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRoom(null);
    }

    const RoomForm: React.FC<{room: Room | null, onSave: (roomData: any) => void, onCancel: () => void}> = ({ room, onSave, onCancel }) => {
        const [name, setName] = useState(room?.name || '');
        const [description, setDescription] = useState(room?.description || '');
        const [pricePerNight, setPricePerNight] = useState(room?.pricePerNight || 0);
        const [capacity, setCapacity] = useState(room?.capacity || 2);
        const [amenities, setAmenities] = useState(room?.amenities.join(', ') || '');
        const [imageUrls, setImageUrls] = useState(room?.imageUrls.join('\n') || '');
        
        const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200";
        const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const roomData = { 
                // Fix: Changed id to _id to match the data model.
                _id: room?._id, name, description, pricePerNight, capacity, 
                amenities: amenities.split(',').map(a => a.trim()),
                imageUrls: imageUrls.split('\n').map(url => url.trim()).filter(url => url)
            };
            onSave(roomData);
        };
        
        return (
             <form onSubmit={handleSubmit}>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div><label className={labelClasses}>Room Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required/></div>
                    <div><label className={labelClasses}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className={inputClasses} rows={3} required/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClasses}>Price Per Night ($)</label><input type="number" value={pricePerNight} onChange={e => setPricePerNight(Number(e.target.value))} className={inputClasses} required/></div>
                        <div><label className={labelClasses}>Capacity</label><input type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} className={inputClasses} required/></div>
                    </div>
                    <div><label className={labelClasses}>Amenities (comma-separated)</label><input type="text" value={amenities} onChange={e => setAmenities(e.target.value)} className={inputClasses} required/></div>
                    <div><label className={labelClasses}>Image URLs (one per line)</label><textarea value={imageUrls} onChange={e => setImageUrls(e.target.value)} className={inputClasses} rows={4} required/></div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg transition duration-300 dark:bg-gray-600 dark:text-gray-200">Cancel</button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">Save Room</button>
                </div>
            </form>
        )
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Room Management</h1>
                <button onClick={openAddModal} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-300">
                    Add New Room
                </button>
            </div>
             <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Room Name</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Price/Night</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Capacity</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.length > 0 ? rooms.map((room) => (
                                <tr key={room._id} className="border-b dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{room.name}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">${room.pricePerNight}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{room.capacity} Guests</td>
                                    <td className="px-6 py-4 space-x-4">
                                        <button onClick={() => openEditModal(room)} className="text-blue-600 hover:underline font-semibold dark:text-blue-400">Edit</button>
                                        <button onClick={() => handleDelete(room._id)} className="text-red-600 hover:underline font-semibold dark:text-red-400">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500 dark:text-gray-400">No rooms configured. Click "Add New Room" to start.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingRoom ? "Edit Room" : "Add New Room"}>
                <RoomForm 
                    room={editingRoom}
                    onCancel={closeModal}
                    onSave={(roomData) => {
                        if(editingRoom) {
                            updateRoom(roomData);
                        } else {
                            addRoom(roomData);
                        }
                        closeModal();
                    }}
                />
            </Modal>
        </div>
    );
};
export default RoomsPage;