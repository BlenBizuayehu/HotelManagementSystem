import React, { useState } from 'react';
import Card from '../components/Card';
import Footer from '../components/Footer';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useAppContext } from '../state/AppContext';
import { View } from '../types';

interface AddTestimonialPageProps {
  navigateTo: (view: View) => void;
}

const StarRating: React.FC<{ rating: number, setRating: (rating: number) => void }> = ({ rating, setRating }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button type="button" key={star} onClick={() => setRating(star)} aria-label={`Rate ${star} stars`}>
            <svg className={`h-10 w-10 cursor-pointer transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.364 1.118l1.287 3.956c.3.921-.755 1.688-1.539 1.118l-3.368-2.447a1 1 0 00-1.175 0l-3.368 2.447c-.784.57-1.838-.197-1.539-1.118l1.287-3.956a1 1 0 00-.364-1.118L2.05 9.383c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
            </svg>
        </button>
      ))}
    </div>
  );
};

const AddTestimonialPage: React.FC<AddTestimonialPageProps> = ({ navigateTo }) => {
  const { addTestimonial } = useAppContext();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await addTestimonial({ name, location, rating, comment });
    setIsLoading(false);
    navigateTo(View.PUBLIC_TESTIMONIALS);
  };
  
  const inputClasses = "mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200";

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
       <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">Elysian</div>
          <div className="flex items-center space-x-4">
            <button onClick={() => navigateTo(View.LANDING)} className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-semibold">
                &larr; Back to Home
            </button>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 lg:p-12">
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">Share Your Experience</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">We value your feedback. Let us know how your stay was!</p>
            </div>
            <Card>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Rating</label>
                        <div className="mt-2">
                           <StarRating rating={rating} setRating={setRating} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location (e.g., City, Country)</label>
                        <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} className={inputClasses} required />
                    </div>
                     <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Review</label>
                        <textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} rows={5} className={inputClasses} required placeholder="Tell us about your stay..."></textarea>
                    </div>
                    <div className="pt-2">
                         <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
                            {isLoading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddTestimonialPage;