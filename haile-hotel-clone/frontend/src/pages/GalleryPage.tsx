import React, { useEffect, useState } from 'react';
import { galleryAPI } from '../services/api';
import type { GalleryItem } from '../types';

const GalleryPage: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const categories = [
    { value: '', label: 'All' },
    { value: 'rooms', label: 'Rooms' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'spa', label: 'Spa' },
    { value: 'events', label: 'Events' },
    { value: 'general', label: 'General' },
  ];

  useEffect(() => {
    fetchGallery();
  }, [selectedCategory]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory) params.category = selectedCategory;
      const response = await galleryAPI.getAll(params);
      setGallery(response.data);
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
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

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Photo Gallery</h1>
          <p className="text-xl text-gray-300">
            Explore our beautiful property through stunning photographs
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {gallery.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">No images found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedImage(item)}
                  className="relative h-64 overflow-hidden rounded-lg cursor-pointer group"
                >
                  <img
                    src={item.image.url}
                    alt={item.image.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                    <i className="fas fa-search-plus text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </div>
                  {item.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                      <p className="text-white font-semibold">{item.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
            >
              <i className="fas fa-times"></i>
            </button>
            <img
              src={selectedImage.image.url}
              alt={selectedImage.image.alt}
              className="max-w-full max-h-[90vh] object-contain"
            />
            {(selectedImage.title || selectedImage.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
                {selectedImage.title && (
                  <h3 className="text-xl font-semibold mb-2">{selectedImage.title}</h3>
                )}
                {selectedImage.description && (
                  <p className="text-gray-300">{selectedImage.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
