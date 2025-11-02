
import React, { useState } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { BellIcon } from '../constants';
import { useAppContext } from '../state/AppContext';
import { Service } from '../types';

const ServicesPage: React.FC = () => {
    const { services, addService, updateService, deleteService } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const openAddModal = () => {
        setEditingService(null);
        setIsModalOpen(true);
    };

    const openEditModal = (service: Service) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            deleteService(id);
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
    }

    const ServiceForm: React.FC<{service: Service | null, onSave: (serviceData: any) => void, onCancel: () => void}> = ({ service, onSave, onCancel }) => {
        const [name, setName] = useState(service?.name || '');
        const [description, setDescription] = useState(service?.description || '');
        const [category, setCategory] = useState<Service['category']>(service?.category || 'Other');
        const [price, setPrice] = useState(service?.price || 0);
        const [imageUrls, setImageUrls] = useState(service?.imageUrls?.join('\n') || '');
        
        const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200";
        const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const serviceData = { 
                _id: service?._id, name, description, category, price,
                imageUrls: imageUrls.split('\n').map(url => url.trim()).filter(url => url)
            };
            onSave(serviceData);
        };
        
        return (
             <form onSubmit={handleSubmit}>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div>
                        <label className={labelClasses}>Service Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required/>
                    </div>
                    <div>
                        <label className={labelClasses}>Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className={inputClasses} rows={3} required/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className={labelClasses}>Category</label>
                           <select value={category} onChange={e => setCategory(e.target.value as Service['category'])} className={inputClasses}>
                                <option>Spa & Wellness</option>
                                <option>Dining</option>
                                <option>Meetings & Events</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                           <label className={labelClasses}>Price ($)</label>
                           <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className={inputClasses} required/>
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Image URLs (one per line)</label>
                        <textarea value={imageUrls} onChange={e => setImageUrls(e.target.value)} className={inputClasses} rows={3}/>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg transition duration-300 dark:bg-gray-600 dark:text-gray-200">Cancel</button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">Save Service</button>
                </div>
            </form>
        )
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Services Management</h1>
                <button onClick={openAddModal} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-300">
                    Add New Service
                </button>
            </div>
             <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Service Name</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Category</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Price</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.length > 0 ? services.map((service) => (
                                <tr key={service._id} className="border-b dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 flex items-center">
                                        <BellIcon className="h-5 w-5 mr-3 text-blue-500" />
                                        {service.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{service.category}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">${service.price}</td>
                                    <td className="px-6 py-4 space-x-4">
                                        <button onClick={() => openEditModal(service)} className="text-blue-600 hover:underline font-semibold dark:text-blue-400">Edit</button>
                                        <button onClick={() => handleDelete(service._id)} className="text-red-600 hover:underline font-semibold dark:text-red-400">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500 dark:text-gray-400">No services configured. Click "Add New Service" to start.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingService ? "Edit Service" : "Add New Service"}>
                <ServiceForm 
                    service={editingService}
                    onCancel={closeModal}
                    onSave={(serviceData) => {
                        if(editingService) {
                            updateService(serviceData);
                        } else {
                            addService(serviceData);
                        }
                        closeModal();
                    }}
                />
            </Modal>
        </div>
    );
};
export default ServicesPage;