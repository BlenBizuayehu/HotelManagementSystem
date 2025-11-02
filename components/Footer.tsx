import React, { useState } from 'react';
import { useAppContext } from '../state/AppContext';
import { View } from '../types';


const Footer: React.FC = () => {
    const { navigateTo, addSubscriber } = useAppContext();
    const [email, setEmail] = useState('');

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            addSubscriber(email);
            setEmail('');
        }
    }

    return (
        <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-12">
            <div className="container mx-auto py-12 px-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div className="lg:col-span-1">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">The Elysian Hotel</h3>
                        <p className="text-gray-600 dark:text-gray-400">Experience unparalleled luxury and bespoke service in the heart of the city.</p>
                    </div>

                    {/* Links Section */}
                    <div className="lg:col-span-1">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Explore</h3>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                            <li><button onClick={() => navigateTo(View.LANDING)} className="hover:text-blue-600 dark:hover:text-blue-400">Home</button></li>
                            <li><button onClick={() => navigateTo(View.BLOG)} className="hover:text-blue-600 dark:hover:text-blue-400">News & Events</button></li>
                            <li><button onClick={() => navigateTo(View.PUBLIC_TESTIMONIALS)} className="hover:text-blue-600 dark:hover:text-blue-400">Testimonials</button></li>
                        </ul>
                    </div>

                    {/* Newsletter Section */}
                    <div className="md:col-span-2 lg:col-span-2">
                         <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Stay Updated</h3>
                         <p className="text-gray-600 dark:text-gray-400 mb-4">Subscribe to our newsletter for the latest news and exclusive offers.</p>
                         <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="flex-grow px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                required
                            />
                            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-300 whitespace-nowrap">
                                Subscribe
                            </button>
                         </form>
                    </div>
                </div>
                <div className="text-center text-gray-500 dark:text-gray-500 mt-10 border-t dark:border-gray-700 pt-6">
                    <p>&copy; {new Date().getFullYear()} The Elysian Hotel. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;