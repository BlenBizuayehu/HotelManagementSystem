# Haile Hotels and Resorts - Website Clone

A complete clone of the Haile Hotels and Resorts website with full functionality including room booking, gallery, contact forms, and more.

## Features

- 🏨 **Homepage**: Hero section with booking widget, featured rooms, amenities
- 🛏️ **Rooms**: Room listings with filters, details, and availability
- 📅 **Booking System**: Complete reservation system with date selection
- 📸 **Gallery**: Image gallery with lightbox
- 📧 **Contact**: Contact form and location information
- 📱 **Responsive**: Fully responsive design for all devices
- 💳 **Payment**: Payment integration ready
- 🌐 **Multi-language**: Support for multiple languages

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

3. **Access**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

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
