
const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { 
        type: String, 
        required: true,
        enum: ['Admin', 'Manager', 'Staff'],
        default: 'Staff'
    },
    department: { type: String, required: true },
    salary: { type: Number, default: 0 },
    contactInfo: {
        email: { type: String },
        phone: { type: String },
        address: { type: String }
    },
    assignedShifts: [{
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        shift: { type: String, enum: ['Morning (9AM-5PM)', 'Evening (3PM-11PM)', 'Night (11PM-7AM)'] }
    }],
    documents: [{
        type: { type: String, enum: ['ID', 'Contract', 'Certificate', 'Other'] },
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    performanceMetrics: {
        rating: { type: Number, min: 0, max: 5, default: 0 },
        reviews: [{
            reviewer: String,
            comment: String,
            rating: { type: Number, min: 0, max: 5 },
            date: { type: Date, default: Date.now }
        }]
    },
    attendance: {
        totalHours: { type: Number, default: 0 },
        lastCheckIn: Date,
        lastCheckOut: Date
    },
    dateJoined: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['Active', 'On Leave', 'Terminated'],
        default: 'Active' 
    },
    deletedAt: { type: Date, default: null }, // Soft delete
}, {
    timestamps: true
});

// Index for search and filtering
EmployeeSchema.index({ name: 'text', department: 'text', role: 'text' });
EmployeeSchema.index({ department: 1, role: 1, status: 1 });
EmployeeSchema.index({ deletedAt: 1 });

// Query helper to exclude soft-deleted employees
EmployeeSchema.query.active = function() {
    return this.where({ deletedAt: null });
};

module.exports = mongoose.model('Employee', EmployeeSchema);
