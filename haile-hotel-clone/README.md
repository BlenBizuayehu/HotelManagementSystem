# Haile Hotels and Resorts - Website Clone

A complete clone of the Haile Hotels and Resorts website with full functionality including room booking, gallery, contact forms, and more.

## Features

### Public Website
- 🏨 **Homepage**: Hero section with booking widget, featured rooms, amenities
- 🛏️ **Rooms**: Room listings with filters, details, and availability
- 📅 **Booking System**: Complete reservation system with date selection
- 📸 **Gallery**: Image gallery with lightbox
- 📧 **Contact**: Contact form and location information
- 📱 **Responsive**: Fully responsive design for all devices

### Admin Panel
- 🔐 **Admin Authentication**: Secure login system with JWT tokens
- 📊 **Dashboard**: Real-time statistics and overview
- 👥 **Employee Management**: Create, view, update, and manage employees
- 📅 **Schedule Management**: Assign and manage employee schedules
- 🛏️ **Room Management**: Full CRUD operations for rooms
- 📋 **Booking Management**: View, filter, and update all bookings
- 📦 **Inventory Management**: Track and manage hotel inventory with low-stock alerts
- 🔒 **Role-Based Access**: Permission-based access control

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS (via CDN for quick setup)

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer for emails

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Installation

1. **Backend Setup**
   ```bash
   cd haile-hotel-clone/backend
   npm install
   cp .env.example .env
   # Configure your .env file
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd haile-hotel-clone/frontend
   npm install
   npm run dev
   ```

3. **Create Admin Account**
   ```bash
   cd haile-hotel-clone/backend
   node seeders/adminSeeder.js
   ```
   Default credentials:
   - Username: `admin`
   - Email: `admin@hailehotels.com`
   - Password: `admin123`
   ⚠️ **Change password after first login!**

4. **Access**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:5173/admin/login

## Project Structure

```
haile-hotel-clone/
├── backend/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.tsx
│   └── package.json
└── README.md
```
