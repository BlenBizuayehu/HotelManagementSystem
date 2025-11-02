

import React, { useState } from 'react';
import Card from '../components/Card';
import { MoonIcon } from '../constants';
import { useAppContext } from '../state/AppContext';
import { View } from '../types';

interface LoginPageProps {
  navigateTo: (view: View) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ navigateTo }) => {
    const { login } = useAppContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await login(username, password);
        if (success) {
            navigateTo(View.DASHBOARD);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md mx-auto">
                 <div className="flex justify-center items-center mb-8 text-gray-800 dark:text-gray-100">
                    <MoonIcon className="h-12 w-12 text-blue-600" />
                    <h1 className="text-4xl font-bold ml-3">Elysian Portal</h1>
                </div>
                
                <Card className="w-full">
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-center text-gray-700 dark:text-gray-200 mb-6">Admin Login</h2>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                    required
                                    placeholder="Username"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                    required
                                    placeholder="Password"
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                                >
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Card>

                <div className="text-center mt-8">
                     <button onClick={() => navigateTo(View.LANDING)} className="text-gray-600 hover:text-blue-600 hover:underline dark:text-gray-400 dark:hover:text-blue-400">
                        &larr; Back to Main Website
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;