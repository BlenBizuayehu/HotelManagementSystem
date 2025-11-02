
const mongoose = require('mongoose');

const SpaGymAppointmentSchema = new mongoose.Schema({
    service: { type: String, required: true },
    guestName: { type: String, required: true },
    time: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Confirmed', 'Completed'],
        default: 'Confirmed'
    },
});

module.exports = mongoose.model('SpaGymAppointment', SpaGymAppointmentSchema);
