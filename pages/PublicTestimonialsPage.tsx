// Fix: Provide full content for TestimonialsPage.tsx
import React from 'react';
import Card from '../components/Card';
import Footer from '../components/Footer';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useAppContext } from '../state/AppContext';
import { View } from '../types';

interface PublicTestimonialsPageProps {
  navigateTo: (view: View) => void;
}

const PublicTestimonialsPage: React.FC<PublicTestimonialsPageProps> = ({ navigateTo }) => {
  const { testimonials } = useAppContext();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">Elysian</div>
          <nav className="hidden md:flex items-center space-x-6">
                <button onClick={() => navigateTo(View.LANDING)} className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-semibold">Home</button>
                <button onClick={() => navigateTo(View.BLOG)} className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-semibold">News</button>
                <button onClick={() => navigateTo(View.PUBLIC_TESTIMONIALS)} className="text-blue-600 dark:text-blue-400 font-semibold">Testimonials</button>
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
          <h1 className="text-5xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">Guest Experiences</h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Hear what our valued guests have to say about their stay at The Elysian Hotel.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial._id} className="p-6 flex flex-col items-center text-center">
              <img src={testimonial.avatarUrl} alt={testimonial.name} className="w-24 h-24 rounded-full object-cover mb-4 shadow-lg" />
              <p className="text-gray-600 dark:text-gray-400 italic">"{testimonial.comment}"</p>
              <div className="mt-4">
                <div className="font-bold text-lg text-gray-800 dark:text-gray-100">{testimonial.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location}</div>
                <div className="flex justify-center mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.364 1.118l1.287 3.956c.3.921-.755 1.688-1.539 1.118l-3.368-2.447a1 1 0 00-1.175 0l-3.368 2.447c-.784.57-1.838-.197-1.539-1.118l1.287-3.956a1 1 0 00-.364-1.118L2.05 9.383c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" /></svg>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-16">
            <button onClick={() => navigateTo(View.ADD_TESTIMONIAL)} className="bg-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-blue-700 transition duration-300 text-lg shadow-lg">
                Share Your Experience
            </button>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default PublicTestimonialsPage;