import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'tachometer-alt' },
    { path: '/admin/bookings', label: 'Bookings', icon: 'calendar-check' },
    { path: '/admin/rooms', label: 'Rooms', icon: 'bed' },
    { path: '/admin/employees', label: 'Employees', icon: 'users' },
    { path: '/admin/schedules', label: 'Schedules', icon: 'calendar-alt' },
    { path: '/admin/inventory', label: 'Inventory', icon: 'box' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-gray-400 text-sm">Haile Hotels</p>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-900 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <i className={`fas fa-${item.icon} w-5`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
