
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    guestPhone: { type: String, required: true },
    itemName: { type: String, required: true },
    itemType: { type: String, required: true },
    checkIn: { type: String },
    checkOut: { type: String },
    status: { 
        type: String, 
        enum: ['Confirmed', 'Pending', 'Cancelled'],
        default: 'Pending' 
    },
    paymentIntentId: { type: String },
    amount: { type: Number },
    currency: { type: String, default: 'usd' },
    paidAt: { type: Date },
    refundedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', BookingSchema);
