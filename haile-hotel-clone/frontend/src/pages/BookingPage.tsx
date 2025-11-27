import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { bookingsAPI, roomsAPI } from '../services/api';
import type { Room } from '../types';

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  });
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRooms();
    const state = location.state as any;
    if (state?.roomId) {
      setSelectedRoom(state.roomId);
    }
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomsAPI.getAll({ available: true });
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !checkIn || !checkOut) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await bookingsAPI.create({
        room: selectedRoom,
        guest: guestInfo,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        adults,
        children,
        specialRequests,
      });

      navigate(`/booking/confirmation/${response.data.bookingReference}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  return (
    <div className="pt-20 min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Book Your Stay</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Room *
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a room</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.name} - ${room.price}/night
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check In *
              </label>
              <DatePicker
                selected={checkIn}
                onChange={(date) => setCheckIn(date)}
                minDate={minDate}
                placeholderText="Select check-in date"
                className="w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check Out *
              </label>
              <DatePicker
                selected={checkOut}
                onChange={(date) => setCheckOut(date)}
                minDate={checkIn || minDate}
                placeholderText="Select check-out date"
                className="w-full"
                required
              />
            </div>
          </div>

          {/* Guests */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adults *
              </label>
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Children
              </label>
              <select
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {[0, 1, 2, 3, 4].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Guest Information */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Guest Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name *"
                required
                value={guestInfo.firstName}
                onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Last Name *"
                required
                value={guestInfo.lastName}
                onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="email"
                placeholder="Email *"
                required
                value={guestInfo.email}
                onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="tel"
                placeholder="Phone *"
                required
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Address"
                value={guestInfo.address}
                onChange={(e) => setGuestInfo({ ...guestInfo, address: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="City"
                value={guestInfo.city}
                onChange={(e) => setGuestInfo({ ...guestInfo, city: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Country"
                value={guestInfo.country}
                onChange={(e) => setGuestInfo({ ...guestInfo, country: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2"
              />
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Any special requests or notes..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Complete Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
