const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., "Morning Shift", "Evening Shift"
    startTime: { type: String, required: true }, // Format: "HH:MM" (24-hour format)
    endTime: { type: String, required: true }, // Format: "HH:MM" (24-hour format)
    description: { type: String }, // Optional description
    isActive: { type: Boolean, default: true }, // Allow disabling shifts without deleting
    daysOfWeek: [{ // Which days this shift applies to (optional - if empty, applies to all days)
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    color: { type: String, default: '#3B82F6' }, // For UI display
}, {
    timestamps: true
});

// Helper function to format time
const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
};

// Virtual for display format
ShiftSchema.virtual('displayTime').get(function() {
    return `${formatTime(this.startTime)} - ${formatTime(this.endTime)}`;
});

ShiftSchema.set('toJSON', { virtuals: true });
ShiftSchema.set('toObject', { virtuals: true });

// Index for active shifts
ShiftSchema.index({ isActive: 1 });

module.exports = mongoose.model('Shift', ShiftSchema);
