// Fix: Provide full content for Testimonial.js
const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    avatarUrl: { type: String, required: false },
});

module.exports = mongoose.model('Testimonial', TestimonialSchema);
