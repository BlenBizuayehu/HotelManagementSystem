
const mongoose = require('mongoose');

const ServiceBookingSchema = new mongoose.Schema({
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    guestPhone: { type: String },
    bookingDate: { type: Date, required: true },
    bookingTime: { type: String, required: true }, // Format: "HH:MM"
    duration: { type: Number, default: 60 }, // Duration in minutes
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: {
        type: String,
        enum: ['Upcoming', 'Completed', 'Cancelled', 'No-Show'],
        default: 'Upcoming'
    },
    notes: String,
    totalPrice: { type: Number, required: true },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Refunded'],
        default: 'Pending'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ServiceBookingSchema.index({ service: 1, bookingDate: 1 });
ServiceBookingSchema.index({ status: 1, bookingDate: 1 });
ServiceBookingSchema.index({ guestEmail: 1 });

module.exports = mongoose.model('ServiceBooking', ServiceBookingSchema);
