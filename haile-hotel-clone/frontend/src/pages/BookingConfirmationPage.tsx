import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI } from '../services/api';
import type { Booking } from '../types';

const BookingConfirmationPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reference) {
      fetchBooking();
    }
  }, [reference]);

  const fetchBooking = async () => {
    try {
      const response = await bookingsAPI.getByReference(reference!);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-2xl">Booking not found</div>
      </div>
    );
  }

  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="pt-20 min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-green-600 text-4xl"></i>
          </div>
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-8">
            Your reservation has been successfully confirmed. Booking reference:{' '}
            <span className="font-semibold text-blue-900">{booking.bookingReference}</span>
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Room:</span>
                <span className="font-semibold">{booking.room.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in:</span>
                <span className="font-semibold">
                  {new Date(booking.checkIn).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-semibold">
                  {new Date(booking.checkOut).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests:</span>
                <span className="font-semibold">
                  {booking.adults} Adult{booking.adults > 1 ? 's' : ''}
                  {booking.children > 0 && `, ${booking.children} Child${booking.children > 1 ? 'ren' : ''}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nights:</span>
                <span className="font-semibold">{nights}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">Total Price:</span>
                <span className="font-bold text-xl text-blue-900">${booking.totalPrice}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="text-xl font-semibold mb-4">Guest Information</h2>
            <div className="space-y-2">
              <p>
                <span className="text-gray-600">Name:</span>{' '}
                <span className="font-semibold">
                  {booking.guest.firstName} {booking.guest.lastName}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Email:</span>{' '}
                <span className="font-semibold">{booking.guest.email}</span>
              </p>
              <p>
                <span className="text-gray-600">Phone:</span>{' '}
                <span className="font-semibold">{booking.guest.phone}</span>
              </p>
            </div>
          </div>

          <div className="flex space-x-4 justify-center">
            <Link
              to="/"
              className="bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Back to Home
            </Link>
            <Link
              to="/rooms"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              View More Rooms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
