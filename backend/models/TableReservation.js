
const mongoose = require('mongoose');

const TableReservationSchema = new mongoose.Schema({
    restaurantName: { type: String, required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'RestaurantTable', required: true },
    tableNumber: { type: String, required: true },
    
    // Guest information
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    guestPhone: { type: String },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }, // If part of room booking
    
    // Reservation details
    reservationDate: { type: Date, required: true },
    reservationTime: { type: String, required: true }, // Format: "HH:MM"
    duration: { type: Number, default: 120 }, // Duration in minutes
    numberOfGuests: { type: Number, required: true },
    
    // Status
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Seated', 'Completed', 'Cancelled', 'No Show'],
        default: 'Pending'
    },
    
    // Special requests
    specialRequests: { type: String },
    dietaryRestrictions: [String],
    
    // Charges
    coverCharge: { type: Number, default: 0 },
    minimumSpend: { type: Number, default: 0 },
    
    // Notes
    notes: { type: String },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
TableReservationSchema.index({ tableId: 1 });
TableReservationSchema.index({ reservationDate: 1, reservationTime: 1 });
TableReservationSchema.index({ guestEmail: 1 });
TableReservationSchema.index({ status: 1 });

module.exports = mongoose.model('TableReservation', TableReservationSchema);
