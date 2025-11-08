import React, { useState } from 'react';
import Card from '../components/Card';
import Footer from '../components/Footer';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { amenityIcons } from '../constants';
import { useAppContext } from '../state/AppContext';
import { Room, Service, View } from '../types';

interface DetailPageProps {
    item: Room | Service;
    navigateTo: (view: View) => void;
}

const DetailPage: React.FC<DetailPageProps> = ({ item, navigateTo }) => {
    const { addBooking, addNotification, searchDates } = useAppContext();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageAnimationKey, setImageAnimationKey] = useState(0); // For re-triggering animation

    // Form state
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [isBooking, setIsBooking] = useState(false);

    const isRoom = 'pricePerNight' in item;
    const price = isRoom ? item.pricePerNight : item.price;
    const priceUnit = isRoom ? '/night' : '';

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isRoom && (!searchDates.checkIn || !searchDates.checkOut)) {
            addNotification('Please select check-in and check-out dates on the home page before booking a room.', 'error');
            return;
        }

        setIsBooking(true);
        const bookingDetails = {
            guestName,
            guestEmail,
            guestPhone,
            itemName: item.name,
            itemType: isRoom ? 'Room' : 'Service',
            ...(isRoom && { 
                roomId: item._id,
                checkIn: searchDates.checkIn, 
                checkOut: searchDates.checkOut,
                numberOfGuests: 1 // Default to 1, can be made configurable later
            }),
            status: 'Pending',
        };

        await addBooking(bookingDetails);
        setIsBooking(false);
        setGuestName('');
        setGuestEmail('');
        setGuestPhone('');
    };

    const inputClasses = "mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200";

    const prevImage = () => {
        const newIndex = currentImageIndex === 0 ? item.imageUrls.length - 1 : currentImageIndex - 1;
        setCurrentImageIndex(newIndex);
        setImageAnimationKey(prev => prev + 1); // re-trigger animation
    };

    const nextImage = () => {
        const newIndex = currentImageIndex === item.imageUrls.length - 1 ? 0 : currentImageIndex + 1;
        setCurrentImageIndex(newIndex);
        setImageAnimationKey(prev => prev + 1); // re-trigger animation
    };

    const selectImage = (index: number) => {
        if (index !== currentImageIndex) {
            setCurrentImageIndex(index);
            setImageAnimationKey(prev => prev + 1);
        }
    }
    
    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
             <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <button onClick={() => navigateTo(View.LANDING)} className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-semibold">
                        &larr; Back to Listings
                    </button>
                    <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 hidden md:block">Elysian</div>
                    <div className="flex items-center space-x-4">
                        <ThemeSwitcher />
                        <button onClick={() => navigateTo(View.DASHBOARD)} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-300">
                            Management Portal
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-6 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    
                    {/* Image Gallery */}
                    <div className="lg:col-span-3">
                         <div className="relative rounded-2xl shadow-2xl overflow-hidden">
                            <img 
                                key={imageAnimationKey}
                                src={item.imageUrls[currentImageIndex]} 
                                alt={`${item.name} view ${currentImageIndex + 1}`} 
                                className="w-full h-auto aspect-[4/3] object-cover animate-fade-in"
                            />
                            {item.imageUrls.length > 1 && (
                                <>
                                 <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-3 rounded-full hover:bg-opacity-60 transition-all focus:outline-none" aria-label="Previous Image">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                 </button>
                                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-3 rounded-full hover:bg-opacity-60 transition-all focus:outline-none" aria-label="Next Image">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                 </button>
                                </>
                            )}
                         </div>
                         {item.imageUrls.length > 1 && (
                            <div className="mt-4 grid grid-cols-5 gap-2">
                                {item.imageUrls.map((url, index) => (
                                    <button key={index} onClick={() => selectImage(index)} className="focus:outline-none focus:ring-4 focus:ring-blue-500 rounded-lg">
                                        <img 
                                            src={url} 
                                            alt={`Thumbnail ${index + 1}`} 
                                            className={`w-full aspect-square object-cover rounded-lg cursor-pointer transition-all duration-200 ${currentImageIndex === index ? 'ring-4 ring-blue-500 scale-105' : 'opacity-60 hover:opacity-100'}`}
                                        />
                                    </button>
                                ))}
                            </div>
                         )}
                    </div>

                    {/* Details and Booking */}
                    <div className="lg:col-span-2">
                        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">{item.name}</h1>
                        <div className="mt-4">
                            <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">${price}</span>
                            <span className="text-xl text-gray-500 dark:text-gray-400 ml-1">{priceUnit}</span>
                        </div>
                         <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                         
                         {isRoom && (
                            <div className="mt-8">
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Amenities</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {(item as Room).amenities.map(amenity => {
                                        const Icon = amenityIcons[amenity];
                                        return (
                                            <div key={amenity} className="flex items-center p-3 bg-blue-50 dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                {Icon && <Icon className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />}
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">{amenity}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                         )}

                         <Card className="mt-8 p-6">
                            <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Request Booking</h3>
                             <form onSubmit={handleBookingSubmit} className="space-y-4">
                                {isRoom && searchDates.checkIn && searchDates.checkOut && (
                                     <div className="p-3 bg-blue-50 dark:bg-gray-700 rounded-lg text-center">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">Selected Dates:</p>
                                        <p className="text-blue-600 dark:text-blue-400">{searchDates.checkIn} to {searchDates.checkOut}</p>
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                    <input type="text" id="name" value={guestName} onChange={(e) => setGuestName(e.target.value)} className={inputClasses} required />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                    <input type="email" id="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className={inputClasses} required />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                                    <input type="tel" id="phone" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className={inputClasses} required />
                                </div>
                                <button type="submit" disabled={isBooking} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
                                    {isBooking ? 'Submitting...' : 'Submit Booking Request'}
                                </button>
                            </form>
                         </Card>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
};

export default DetailPage;
