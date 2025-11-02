// Fix: Provide full content for LandingPage.tsx
import React, { useCallback, useEffect, useState } from 'react';
import Card from '../components/Card';
import Footer from '../components/Footer';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useAppContext } from '../state/AppContext';
import { Room, Service, View } from '../types';

interface LandingPageProps {
  navigateTo: (view: View, item?: Room | Service) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ navigateTo }) => {
  const { availableRooms, services, searchDates, setSearchDates, fetchAvailableRooms } = useAppContext();
  const [activeTab, setActiveTab] = useState<'rooms' | 'services'>('rooms');

  const stableFetch = useCallback(() => {
    if(searchDates.checkIn && searchDates.checkOut) {
      fetchAvailableRooms();
    }
  }, [searchDates.checkIn, searchDates.checkOut, fetchAvailableRooms]);

  useEffect(() => {
    stableFetch()
  }, [stableFetch]);
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchDates(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const renderRoomCard = (room: Room) => (
    <Card key={room._id} className="flex flex-col">
        <img src={room.imageUrls[0]} alt={room.name} className="w-full h-56 object-cover" />
        <div className="p-6 flex-grow flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{room.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2 flex-grow">{room.description.substring(0, 100)}...</p>
            <div className="mt-4 flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${room.pricePerNight}<span className="text-sm font-normal">/night</span></span>
                <button onClick={() => navigateTo(View.DETAIL, room)} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-300">
                    View Details
                </button>
            </div>
        </div>
    </Card>
  );

  const renderServiceCard = (service: Service) => (
     <Card key={service._id} className="flex flex-col">
        <img src={service.imageUrls && service.imageUrls[0] ? service.imageUrls[0] : 'https://picsum.photos/seed/service/400/300'} alt={service.name} className="w-full h-56 object-cover" />
        <div className="p-6 flex-grow flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{service.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2 flex-grow">{service.description.substring(0, 100)}...</p>
            <div className="mt-4 flex justify-between items-center">
                 <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${service.price}</span>
                 <button onClick={() => navigateTo(View.DETAIL, service)} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-300">
                    Learn More
                </button>
            </div>
        </div>
    </Card>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">Elysian</div>
            <nav className="hidden md:flex items-center space-x-6">
                <button onClick={() => navigateTo(View.LANDING)} className="text-blue-600 dark:text-blue-400 font-semibold">Home</button>
                <button onClick={() => navigateTo(View.BLOG)} className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-semibold">News</button>
                <button onClick={() => navigateTo(View.PUBLIC_TESTIMONIALS)} className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-semibold">Testimonials</button>
            </nav>
            <div className="flex items-center space-x-4">
                <ThemeSwitcher />
                <button onClick={() => navigateTo(View.DASHBOARD)} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-300">
                    Management Portal
                </button>
            </div>
        </div>
      </header>
      
      <main className="container mx-auto p-6 lg:p-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">Experience Unparalleled Luxury</h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Discover a world of comfort, elegance, and bespoke service at The Elysian Hotel.</p>
        </div>

        <Card className="p-6 mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <div>
                    <label className="font-semibold text-gray-700 dark:text-gray-300">Check-in</label>
                    <input type="date" name="checkIn" value={searchDates.checkIn} onChange={handleDateChange} className="mt-1 w-full md:w-auto p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                    <label className="font-semibold text-gray-700 dark:text-gray-300">Check-out</label>
                    <input type="date" name="checkOut" value={searchDates.checkOut} onChange={handleDateChange} className="mt-1 w-full md:w-auto p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600" />
                </div>
            </div>
             {searchDates.checkIn && searchDates.checkOut && (new Date(searchDates.checkOut) <= new Date(searchDates.checkIn)) &&
                <p className="text-red-500 text-center mt-2">Check-out date must be after check-in date.</p>
            }
        </Card>

        <div>
          <div className="flex justify-center border-b dark:border-gray-700 mb-8">
            <button onClick={() => setActiveTab('rooms')} className={`px-8 py-3 text-lg font-semibold transition-colors ${activeTab === 'rooms' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Rooms & Suites</button>
            <button onClick={() => setActiveTab('services')} className={`px-8 py-3 text-lg font-semibold transition-colors ${activeTab === 'services' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Hotel Services</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeTab === 'rooms' && availableRooms.map(renderRoomCard)}
            {activeTab === 'services' && services.map(renderServiceCard)}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;