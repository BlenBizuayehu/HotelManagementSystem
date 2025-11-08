
const mongoose = require('mongoose');

const RestaurantTableSchema = new mongoose.Schema({
    tableNumber: { type: String, required: true, unique: true },
    restaurantName: { type: String, required: true }, // e.g., "Main Restaurant", "Pool Bar", "Room Service"
    
    // Table details
    capacity: { type: Number, required: true },
    tableType: {
        type: String,
        enum: ['Indoor', 'Outdoor', 'Private', 'Bar', 'Counter'],
        default: 'Indoor'
    },
    location: { type: String }, // e.g., "Window", "Corner", "Center"
    
    // Status
    status: {
        type: String,
        enum: ['Available', 'Occupied', 'Reserved', 'Out of Service'],
        default: 'Available'
    },
    
    // Current reservation
    currentReservation: {
        reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'TableReservation' },
        guestName: String,
        guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        reservedFrom: Date,
        reservedUntil: Date,
        numberOfGuests: Number
    },
    
    // Features
    features: [String], // e.g., "Window View", "Quiet", "Wheelchair Accessible"
    smokingAllowed: { type: Boolean, default: false },
    
    // Statistics
    totalReservations: { type: Number, default: 0 },
    averageOccupancy: { type: Number, default: 0 },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
RestaurantTableSchema.index({ tableNumber: 1 });
RestaurantTableSchema.index({ restaurantName: 1, status: 1 });
RestaurantTableSchema.index({ status: 1, capacity: 1 });

module.exports = mongoose.model('RestaurantTable', RestaurantTableSchema);
