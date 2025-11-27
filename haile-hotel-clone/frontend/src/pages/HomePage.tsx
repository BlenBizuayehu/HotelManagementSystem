import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookingWidget from '../components/BookingWidget';
import { roomsAPI, galleryAPI } from '../services/api';
import type { Room, GalleryItem } from '../types';

const HomePage: React.FC = () => {
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, galleryRes] = await Promise.all([
          roomsAPI.getAll({ featured: true }),
          galleryAPI.getAll({ featured: true }),
        ]);
        setFeaturedRooms(roomsRes.data.slice(0, 3));
        setGallery(galleryRes.data.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const amenities = [
    { icon: 'wifi', title: 'Free WiFi' },
    { icon: 'swimming-pool', title: 'Swimming Pool' },
    { icon: 'spa', title: 'Spa & Wellness' },
    { icon: 'utensils', title: 'Fine Dining' },
    { icon: 'car', title: 'Free Parking' },
    { icon: 'concierge-bell', title: '24/7 Concierge' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Welcome to Haile Hotels
                <span className="block text-blue-400">& Resorts</span>
              </h1>
              <p className="text-xl mb-8 text-gray-200">
                Service built by miles! Experience luxury, comfort, and exceptional hospitality.
              </p>
              <div className="flex space-x-4">
                <Link
                  to="/rooms"
                  className="bg-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                >
                  Explore Rooms
                </Link>
                <Link
                  to="/contact"
                  className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <BookingWidget />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <i className="fas fa-chevron-down text-2xl"></i>
        </div>
      </section>

      {/* Mobile Booking Widget */}
      <section className="lg:hidden bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <BookingWidget />
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Experience Luxury & Comfort
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Haile Hotels and Resorts Group offers world-class accommodation with exceptional
              service. Our commitment to excellence ensures every guest enjoys an unforgettable stay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-hotel text-3xl text-blue-900"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Luxury Accommodation</h3>
              <p className="text-gray-600">
                Spacious rooms and suites designed for your comfort and relaxation.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-utensils text-3xl text-blue-900"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fine Dining</h3>
              <p className="text-gray-600">
                Exquisite cuisine prepared by our world-class chefs using the finest ingredients.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-spa text-3xl text-blue-900"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Wellness & Spa</h3>
              <p className="text-gray-600">
                Rejuvenate your mind and body at our state-of-the-art spa facilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      {featuredRooms.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Rooms</h2>
              <p className="text-xl text-gray-600">Discover our most popular accommodations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredRooms.map((room) => (
                <Link
                  key={room._id}
                  to={`/rooms/${room.slug}`}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={room.images[0]?.url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'}
                      alt={room.images[0]?.alt || room.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-blue-900 text-white px-3 py-1 rounded">
                      ${room.price}/night
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {room.shortDescription || room.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          <i className="fas fa-users mr-1"></i>
                          {room.capacity} Guests
                        </span>
                        {room.size && (
                          <span>
                            <i className="fas fa-expand-arrows-alt mr-1"></i>
                            {room.size}
                          </span>
                        )}
                      </div>
                      <span className="text-blue-900 font-semibold group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/rooms"
                className="inline-block bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                View All Rooms
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Amenities Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Hotel Amenities</h2>
            <p className="text-xl text-gray-600">Everything you need for a perfect stay</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {amenities.map((amenity, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 hover:bg-blue-100 transition-colors">
                  <i className={`fas fa-${amenity.icon} text-2xl text-blue-900`}></i>
                </div>
                <h4 className="font-semibold text-gray-900">{amenity.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      {gallery.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Photo Gallery</h2>
              <p className="text-xl text-gray-600">Take a glimpse of our beautiful property</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((item) => (
                <div
                  key={item._id}
                  className="relative h-64 overflow-hidden rounded-lg group cursor-pointer"
                >
                  <img
                    src={item.image.url}
                    alt={item.image.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity"></div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/gallery"
                className="inline-block bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                View Full Gallery
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Book Your Stay?</h2>
          <p className="text-xl mb-8 text-blue-200">
            Experience the perfect blend of luxury, comfort, and exceptional service
          </p>
          <Link
            to="/booking"
            className="inline-block bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Book Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
