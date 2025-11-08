
const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    // User information
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String },
    role: { type: String },
    
    // Action details
    action: { type: String, required: true }, // e.g., "CREATE_BOOKING", "UPDATE_ROOM", "DELETE_EMPLOYEE"
    entityType: { type: String, required: true }, // e.g., "Booking", "Room", "Employee"
    entityId: { type: mongoose.Schema.Types.ObjectId },
    
    // Changes
    changes: {
        before: mongoose.Schema.Types.Mixed,
        after: mongoose.Schema.Types.Mixed
    },
    
    // Request information
    ipAddress: { type: String },
    userAgent: { type: String },
    method: { type: String }, // HTTP method
    endpoint: { type: String }, // API endpoint
    
    // Result
    status: {
        type: String,
        enum: ['Success', 'Failure', 'Error'],
        default: 'Success'
    },
    errorMessage: { type: String },
    
    // Metadata
    metadata: mongoose.Schema.Types.Mixed, // Additional context
    
    timestamp: { type: Date, default: Date.now }
});

// Indexes for efficient querying
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ username: 1, timestamp: -1 });

// TTL index to auto-delete logs older than 1 year (optional)
// AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
