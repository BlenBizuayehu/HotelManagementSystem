

// Fix: Provide full content for App.tsx
import React from 'react';
import AddTestimonialPage from './pages/AddTestimonialPage';
import AI_Assistant from './pages/AI_Assistant';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import BookingsPage from './pages/BookingsPage';
import Dashboard from './pages/Dashboard';
import DetailPage from './pages/DetailPage';
import HRPage from './pages/HRPage';
import InventoryPage from './pages/InventoryPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NewsAdminPage from './pages/NewsAdminPage';
import PublicTestimonialsPage from './pages/PublicTestimonialsPage';
import RoomsPage from './pages/RoomsPage';
import SchedulePage from './pages/SchedulePage';
import ServicesPage from './pages/ServicesPage';
import ShiftsPage from './pages/ShiftsPage';
import SpaGymPage from './pages/SpaGymPage';
import TestimonialsPage from './pages/TestimonialsPage';
import { useAppContext } from './state/AppContext';
import { View } from './types';

import Sidebar from './components/Sidebar';
import Toast from './components/Toast';

const App: React.FC = () => {
  // Fix: Get view state and navigation from context instead of local state.
  const { 
    notifications, 
    removeNotification, 
    isAuthenticated, 
    currentUser,
    logout,
    currentView,
    detailItem,
    selectedPost,
    navigateTo 
  } = useAppContext();

  // Fix: Simplified logout handler as navigation is now handled within the context's logout function.
  const handleLogout = () => {
    logout();
  };
  
  const renderDashboardView = () => {
    const ADMIN_ONLY_VIEWS = [View.HR, View.INVENTORY, View.SHIFTS];

    if (currentUser?.role === 'Manager' && ADMIN_ONLY_VIEWS.includes(currentView)) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <h1 className="text-4xl font-bold text-red-500 dark:text-red-400">Access Denied</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                    You do not have permission to view this page.
                </p>
                <button 
                    onClick={() => navigateTo(View.DASHBOARD)}
                    className="mt-8 bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }
      
    switch(currentView) {
        case View.DASHBOARD: return <Dashboard />;
        case View.BOOKINGS: return <BookingsPage />;
        case View.ROOMS: return <RoomsPage />;
        case View.SERVICES: return <ServicesPage />;
        case View.HR: return <HRPage />;
        case View.SCHEDULE: return <SchedulePage />;
        case View.SHIFTS: return <ShiftsPage />;
        case View.INVENTORY: return <InventoryPage />;
        case View.SPAGYM: return <SpaGymPage />;
        case View.TESTIMONIALS: return <TestimonialsPage />;
        case View.NEWS_ADMIN: return <NewsAdminPage />;
        case View.AI_ASSISTANT: return <AI_Assistant />;
        default: return <Dashboard />;
    }
  }
  
  const isDashboardView = ![View.LANDING, View.DETAIL, View.LOGIN, View.PUBLIC_TESTIMONIALS, View.ADD_TESTIMONIAL, View.BLOG, View.BLOG_POST].includes(currentView);

  const renderContent = () => {
      if (isDashboardView) {
          if (!isAuthenticated) {
              return <LoginPage navigateTo={navigateTo} />;
          }
          return (
              <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
                  <Sidebar currentView={currentView} navigateTo={navigateTo} logout={handleLogout} />
                  <main className="flex-1 overflow-y-auto">
                      {renderDashboardView()}
                  </main>
              </div>
          );
      }

      switch (currentView) {
          case View.LANDING: return <LandingPage navigateTo={navigateTo} />;
          case View.DETAIL: return detailItem && <DetailPage item={detailItem} navigateTo={navigateTo} />;
          case View.LOGIN: return <LoginPage navigateTo={navigateTo} />;
          case View.PUBLIC_TESTIMONIALS: return <PublicTestimonialsPage navigateTo={navigateTo} />;
          case View.ADD_TESTIMONIAL: return <AddTestimonialPage navigateTo={navigateTo} />;
          case View.BLOG: return <BlogPage navigateTo={navigateTo} />;
          case View.BLOG_POST: return selectedPost && <BlogPostPage post={selectedPost} navigateTo={navigateTo} />;
          default: return <LandingPage navigateTo={navigateTo} />;
      }
  };

  return (
    <>
      {renderContent()}
      
      {/* Toast Notifications Container */}
      <div className="fixed top-5 right-5 z-50 space-y-3 w-full max-w-sm">
        {notifications.map(n => (
          <Toast key={n.id} notification={n} onDismiss={removeNotification} />
        ))}
      </div>
    </>
  );
};

export default App;