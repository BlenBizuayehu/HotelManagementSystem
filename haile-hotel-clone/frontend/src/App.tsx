import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/admin/AdminLayout';
import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminRooms from './pages/admin/AdminRooms';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminSchedules from './pages/admin/AdminSchedules';
import AdminInventory from './pages/admin/AdminInventory';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <HomePage />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/rooms" element={
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <RoomsPage />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/rooms/:slug" element={
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <RoomDetailPage />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/gallery" element={
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <GalleryPage />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/contact" element={
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <ContactPage />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/booking" element={
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <BookingPage />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/booking/confirmation/:reference" element={
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <BookingConfirmationPage />
            </main>
            <Footer />
          </div>
        } />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="schedules" element={<AdminSchedules />} />
          <Route path="inventory" element={<AdminInventory />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
