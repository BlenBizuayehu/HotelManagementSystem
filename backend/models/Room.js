
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    imageUrls: [{ type: String }],
    amenities: [{ type: String }],
    capacity: { type: Number, required: true },
});

module.exports = mongoose.model('Room', RoomSchema);
