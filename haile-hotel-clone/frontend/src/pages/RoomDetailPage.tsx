import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { roomsAPI } from '../services/api';
import type { Room } from '../types';

const RoomDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchRoom();
    }
  }, [slug]);

  const fetchRoom = async () => {
    try {
      setLoading(true);
      const response = await roomsAPI.getOne(slug!);
      setRoom(response.data);
    } catch (error) {
      console.error('Failed to fetch room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    navigate('/booking', {
      state: { roomId: room?._id, roomName: room?.name },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Room not found</div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/rooms" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Rooms
          </Link>
          <h1 className="text-4xl font-bold mb-2">{room.name}</h1>
          <p className="text-xl text-gray-300">{room.shortDescription || room.description}</p>
        </div>
      </section>

      {/* Images */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <img
                  src={room.images[selectedImage]?.url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200'}
                  alt={room.images[selectedImage]?.alt || room.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {room.images.slice(0, 4).map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-32 rounded-lg overflow-hidden ${
                    selectedImage === idx ? 'ring-4 ring-blue-500' : ''
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold mb-4">Room Details</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">{room.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <div className="text-2xl font-bold text-blue-900">{room.capacity}</div>
                  <div className="text-gray-600">Guests</div>
                </div>
                {room.size && (
                  <div>
                    <div className="text-2xl font-bold text-blue-900">{room.size}</div>
                    <div className="text-gray-600">Size</div>
                  </div>
                )}
                {room.bedType && (
                  <div>
                    <div className="text-2xl font-bold text-blue-900">{room.bedType}</div>
                    <div className="text-gray-600">Bed Type</div>
                  </div>
                )}
                <div>
                  <div className="text-2xl font-bold text-blue-900 capitalize">{room.category}</div>
                  <div className="text-gray-600">Category</div>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {room.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <i className="fas fa-check text-green-500"></i>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Card */}
            <div>
              <div className="bg-white border rounded-lg p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-900 mb-2">
                    ${room.price}
                    <span className="text-lg font-normal text-gray-600">/night</span>
                  </div>
                  {room.available ? (
                    <span className="text-green-600 font-semibold">Available</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Not Available</span>
                  )}
                </div>

                <button
                  onClick={handleBookNow}
                  disabled={!room.available}
                  className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
                >
                  Book Now
                </button>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Check-in:</span>
                    <span>2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out:</span>
                    <span>11:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancellation:</span>
                    <span>Free cancellation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoomDetailPage;
