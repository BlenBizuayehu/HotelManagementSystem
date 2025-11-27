import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminInventory: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'furniture',
    description: '',
    quantity: '',
    unit: 'piece',
    unitPrice: '',
    location: '',
    minStockLevel: '10',
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.get('http://localhost:5000/api/admin/inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(data.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        'http://localhost:5000/api/admin/inventory',
        {
          ...formData,
          quantity: Number(formData.quantity),
          unitPrice: Number(formData.unitPrice),
          minStockLevel: Number(formData.minStockLevel),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setFormData({
        name: '',
        category: 'furniture',
        description: '',
        quantity: '',
        unit: 'piece',
        unitPrice: '',
        location: '',
        minStockLevel: '10',
      });
      fetchInventory();
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const handleRestock = async (id: string, quantity: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `http://localhost:5000/api/admin/inventory/${id}/restock`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchInventory();
    } catch (error) {
      console.error('Failed to restock:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
        >
          + Add Item
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.map((item) => (
              <tr key={item._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.itemCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.quantity} {item.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">${item.unitPrice}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'in-stock' ? 'bg-green-100 text-green-800' :
                    item.status === 'low-stock' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => {
                      const qty = prompt('Enter restock quantity:');
                      if (qty) handleRestock(item._id, Number(qty));
                    }}
                    className="text-blue-600 hover:text-blue-800 mr-4"
                  >
                    Restock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add Inventory Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="furniture">Furniture</option>
                    <option value="electronics">Electronics</option>
                    <option value="linens">Linens</option>
                    <option value="cleaning-supplies">Cleaning Supplies</option>
                    <option value="food-beverage">Food & Beverage</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="office-supplies">Office Supplies</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit *</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="piece, kg, liter, etc."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Price *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Stock Level *</label>
                  <input
                    type="number"
                    required
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Storage Room A, Kitchen, etc."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
