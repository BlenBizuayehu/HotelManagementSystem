// Fix: Provide full content for testimonialController.js
const Testimonial = require('../models/Testimonial');

exports.getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ _id: -1 });
        res.json(testimonials);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createTestimonial = async (req, res) => {
    try {
        const testimonialData = { ...req.body };
        // If no avatar is provided, assign a default one based on the user's initials.
        if (!testimonialData.avatarUrl) {
            const seed = encodeURIComponent(testimonialData.name || 'anonymous');
            testimonialData.avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${seed}`;
        }
        
        const newTestimonial = new Testimonial(testimonialData);
        const savedTestimonial = await newTestimonial.save();
        res.status(201).json(savedTestimonial);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
        if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
        res.json({ message: 'Testimonial deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};