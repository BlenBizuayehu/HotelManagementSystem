import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminRooms: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    capacity: '',
    category: 'standard',
    available: true,
    amenities: [] as string[],
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.get('http://localhost:5000/api/admin/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(data.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        'http://localhost:5000/api/admin/rooms',
        { ...formData, price: Number(formData.price), capacity: Number(formData.capacity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: '',
        capacity: '',
        category: 'standard',
        available: true,
        amenities: [],
      });
      fetchRooms();
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rooms Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
        >
          + Add Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room._id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
            <p className="text-gray-600 mb-4">{room.description}</p>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-blue-900">${room.price}</p>
                <p className="text-sm text-gray-500">per night</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                room.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {room.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Room</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Capacity *</label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                    <option value="presidential">Presidential</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800"
                >
                  Create Room
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

export default AdminRooms;
