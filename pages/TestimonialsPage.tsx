import React, { useState } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useAppContext } from '../state/AppContext';
import { View } from '../types';

const TestimonialsPage: React.FC = () => {
    const { testimonials, addTestimonial, deleteTestimonial, addNotification } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this testimonial?')) {
            deleteTestimonial(id);
        }
    };

    const handleGetShareLink = () => {
        const url = `${window.location.origin}?view=${View.ADD_TESTIMONIAL}`;
        navigator.clipboard.writeText(url).then(() => {
            addNotification('Link copied to clipboard!', 'success');
        }, () => {
            addNotification('Could not copy link.', 'error');
        });
    }

    const TestimonialForm: React.FC<{onSave: (data: any) => void, onCancel: () => void}> = ({ onSave, onCancel }) => {
        const [name, setName] = useState('');
        const [location, setLocation] = useState('');
        const [rating, setRating] = useState(5);
        const [comment, setComment] = useState('');

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave({ name, location, rating, comment });
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Guest Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location (e.g., City, Country)</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
                    <input type="number" min="1" max="5" value={rating} onChange={e => setRating(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comment</label>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700" required></textarea>
                </div>
                 <div className="mt-6 flex justify-end space-x-4">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg transition duration-300 dark:bg-gray-600 dark:text-gray-200">Cancel</button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">Save Testimonial</button>
                </div>
            </form>
        );
    }

    return (
        <div className="p-8">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Testimonials</h1>
                <div className="flex items-center gap-4">
                    <button onClick={handleGetShareLink} className="bg-gray-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-gray-700 transition duration-300">
                        Get Sharable Link
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-300">
                        Add Manually
                    </button>
                </div>
            </div>
             <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Guest</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Comment</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Rating</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testimonials.length > 0 ? testimonials.map((testimonial) => (
                                <tr key={testimonial._id} className="border-b dark:border-gray-700">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <img src={testimonial.avatarUrl} alt={testimonial.name} className="h-10 w-10 rounded-full mr-4" />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100">{testimonial.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-sm truncate">{testimonial.comment}</td>
                                    <td className="px-6 py-4 text-yellow-500 font-bold">{testimonial.rating} / 5</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleDelete(testimonial._id)} className="text-red-600 hover:underline font-semibold dark:text-red-400">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500 dark:text-gray-400">No testimonials found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Testimonial">
                <TestimonialForm 
                    onCancel={() => setIsModalOpen(false)}
                    onSave={(data) => {
                        addTestimonial(data);
                        setIsModalOpen(false);
                    }}
                />
            </Modal>
        </div>
    );
};

export default TestimonialsPage;