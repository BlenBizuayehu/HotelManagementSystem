
const mongoose = require('mongoose');

const ParkingSpotSchema = new mongoose.Schema({
    spotNumber: { type: String, required: true, unique: true },
    location: { type: String, required: true }, // e.g., "Main Parking", "Valet", "Underground"
    spotType: {
        type: String,
        enum: ['Standard', 'Compact', 'Handicap', 'Valet', 'EV Charging', 'Oversized'],
        default: 'Standard'
    },
    
    // Status
    status: {
        type: String,
        enum: ['Available', 'Occupied', 'Reserved', 'Out of Service'],
        default: 'Available'
    },
    
    // Current assignment
    currentAssignment: {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        guestName: String,
        guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
        roomNumber: String,
        assignedAt: Date,
        expiresAt: Date
    },
    
    // Pricing
    hourlyRate: { type: Number, default: 0 },
    dailyRate: { type: Number, default: 0 },
    monthlyRate: { type: Number, default: 0 },
    guestIncluded: { type: Boolean, default: false }, // If parking is included with room
    
    // Features
    features: [String], // e.g., "Covered", "Near Entrance", "EV Charging"
    
    // Statistics
    totalAssignments: { type: Number, default: 0 },
    utilizationRate: { type: Number, default: 0 },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
ParkingSpotSchema.index({ spotNumber: 1 });
ParkingSpotSchema.index({ location: 1, status: 1 });
ParkingSpotSchema.index({ status: 1, spotType: 1 });

module.exports = mongoose.model('ParkingSpot', ParkingSpotSchema);
