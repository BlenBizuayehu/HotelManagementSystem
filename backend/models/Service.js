
const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: false, default: 'default' }, // For future use e.g., mapping to an icon name
    category: { 
        type: String, 
        required: true, 
        enum: ['Spa & Wellness', 'Dining', 'Meetings & Events', 'Other']
    },
    price: { type: Number, required: true, default: 0 },
    imageUrls: [{type: String}]
});

module.exports = mongoose.model('Service', ServiceSchema);
