
import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useAppContext } from '../state/AppContext';

const InventoryPage: React.FC = () => {
    const { inventory, addInventoryItem, updateInventoryStock, deleteInventoryItem } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [stock, setStock] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');


    // Fix: Changed id type from number to string to match data model.
    const handleStockChange = (id: string, currentStock: number) => {
        const newStock = prompt("Enter new stock level:", String(currentStock));
        if (newStock !== null && !isNaN(parseInt(newStock))) {
            updateInventoryStock(id, parseInt(newStock));
        }
    };
    
    // Fix: Changed id type from number to string to match data model.
    const handleDelete = (id: string) => {
        if(window.confirm('Are you sure you want to delete this item?')) {
            deleteInventoryItem(id);
        }
    }
    
    const handleAddItemSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addInventoryItem({ name, category, stock });
        setIsModalOpen(false);
        setName('');
        setCategory('');
        setStock(0);
    }
    
    const filteredInventory = useMemo(() => {
        return inventory.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [inventory, searchTerm]);

    const getStatusColor = (status: string) => {
        if (status === 'Out of Stock') return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        if (status === 'Low Stock') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    };
    
    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200";


    return (
        <div className="p-8">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Inventory Management</h1>
                <div className="flex items-center gap-4">
                     <input 
                        type="text"
                        placeholder="Search by item name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                    <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-300 whitespace-nowrap">
                        Add New Item
                    </button>
                </div>
            </div>
             <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Item Name</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Category</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Stock Level</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.length > 0 ? filteredInventory.map((item) => (
                                <tr key={item._id} className="border-b dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.category}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.stock} units</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-x-4">
                                        <button onClick={() => handleStockChange(item._id, item.stock)} className="text-blue-600 hover:underline font-semibold dark:text-blue-400">Update Stock</button>
                                        <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:underline font-semibold dark:text-red-400">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">No inventory items found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Inventory Item">
                <form onSubmit={handleAddItemSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                            <input type="text" value={category} onChange={e => setCategory(e.target.value)} className={inputClasses} required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Stock</label>
                            <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} className={inputClasses} required/>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                            Add Item
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default InventoryPage;