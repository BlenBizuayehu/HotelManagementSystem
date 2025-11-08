
const mongoose = require('mongoose');

const MeetingRoomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    roomNumber: { type: String, required: true, unique: true },
    description: { type: String },
    
    // Capacity and layout
    capacity: { type: Number, required: true },
    layout: {
        type: String,
        enum: ['Theater', 'Classroom', 'Boardroom', 'U-Shape', 'Banquet', 'Reception', 'Flexible'],
        default: 'Flexible'
    },
    area: { type: Number }, // Square meters/feet
    
    // Pricing
    baseHourlyRate: { type: Number, required: true },
    baseDailyRate: { type: Number },
    weekendMultiplier: { type: Number, default: 1.2 },
    seasonalRates: [{
        name: String,
        startDate: Date,
        endDate: Date,
        multiplier: { type: Number, default: 1.0 }
    }],
    
    // Equipment and amenities
    equipment: [{
        name: String, // e.g., "Projector", "Sound System", "Whiteboard"
        available: { type: Boolean, default: true },
        quantity: { type: Number, default: 1 }
    }],
    amenities: [String], // e.g., "WiFi", "Coffee Service", "Catering Available"
    
    // Status
    status: {
        type: String,
        enum: ['Available', 'Booked', 'Under Maintenance', 'Out of Order'],
        default: 'Available'
    },
    
    // Location
    floor: { type: Number },
    location: { type: String }, // e.g., "Main Building", "Conference Center"
    
    // Images
    imageUrls: [{ type: String }],
    
    // Booking restrictions
    minimumBookingHours: { type: Number, default: 1 },
    maximumBookingHours: { type: Number, default: 8 },
    advanceBookingDays: { type: Number, default: 90 }, // How many days in advance can be booked
    
    // Catering options
    cateringAvailable: { type: Boolean, default: false },
    cateringOptions: [{
        name: String,
        price: Number,
        description: String
    }],
    
    // Statistics
    totalBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
MeetingRoomSchema.index({ roomNumber: 1 });
MeetingRoomSchema.index({ status: 1, capacity: 1 });
MeetingRoomSchema.index({ floor: 1 });

module.exports = mongoose.model('MeetingRoom', MeetingRoomSchema);
