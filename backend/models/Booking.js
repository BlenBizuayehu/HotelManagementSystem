
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
});

module.exports = mongoose.model('Booking', BookingSchema);
