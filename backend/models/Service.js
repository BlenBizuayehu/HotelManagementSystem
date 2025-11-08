
const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: false, default: 'default' },
    category: { 
        type: String, 
        required: true, 
        enum: ['Spa & Wellness', 'Gym', 'Dining', 'Meetings & Events', 'Other']
    },
    price: { type: Number, required: true, default: 0 },
    duration: { type: Number, required: true, default: 60 }, // Duration in minutes
    availableTimes: [{
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All'] },
        startTime: String, // Format: "HH:MM"
        endTime: String
    }],
    assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    reviews: [{
        guestName: String,
        rating: { type: Number, min: 0, max: 5 },
        comment: String,
        date: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    imageUrls: [{type: String}]
}, {
    timestamps: true
});

// Calculate average rating before saving
ServiceSchema.pre('save', function(next) {
    if (this.reviews && this.reviews.length > 0) {
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.averageRating = sum / this.reviews.length;
    }
    next();
});

// Index for search and filtering
ServiceSchema.index({ name: 'text', description: 'text', category: 'text' });
ServiceSchema.index({ category: 1, isAvailable: 1 });

module.exports = mongoose.model('Service', ServiceSchema);
