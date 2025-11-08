
const mongoose = require('mongoose');

const HousekeepingTaskSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    roomNumber: { type: String, required: true },
    
    // Task details
    taskType: {
        type: String,
        enum: ['Checkout Clean', 'Stayover Clean', 'Deep Clean', 'Inspection', 'Maintenance Clean'],
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    
    // Assignment
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date, default: Date.now },
    
    // Status tracking
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Inspected', 'Failed'],
        default: 'Pending'
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    inspectedAt: { type: Date },
    inspectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Task checklist
    checklist: [{
        item: String, // e.g., "Make bed", "Clean bathroom", "Restock amenities"
        completed: { type: Boolean, default: false },
        notes: String
    }],
    
    // Notes and issues
    notes: { type: String },
    issues: [{
        description: String,
        reportedAt: { type: Date, default: Date.now },
        resolved: { type: Boolean, default: false }
    }],
    
    // Time tracking
    estimatedDuration: { type: Number, default: 30 }, // minutes
    actualDuration: { type: Number }, // minutes
    
    // Related booking
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    guestName: { type: String },
    checkoutTime: { type: Date },
    
    // Scheduling
    scheduledFor: { type: Date, required: true },
    dueBy: { type: Date },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
HousekeepingTaskSchema.index({ roomId: 1 });
HousekeepingTaskSchema.index({ assignedTo: 1 });
HousekeepingTaskSchema.index({ status: 1 });
HousekeepingTaskSchema.index({ scheduledFor: 1 });
HousekeepingTaskSchema.index({ priority: 1, status: 1 });

module.exports = mongoose.model('HousekeepingTask', HousekeepingTaskSchema);
