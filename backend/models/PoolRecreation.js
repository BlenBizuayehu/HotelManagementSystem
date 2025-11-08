
const mongoose = require('mongoose');

const PoolRecreationSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Main Pool", "Kids Pool", "Gym"
    type: {
        type: String,
        enum: ['Pool', 'Gym', 'Spa', 'Recreation Area', 'Beach Access', 'Tennis Court', 'Other'],
        required: true
    },
    description: { type: String },
    
    // Capacity and access
    maxCapacity: { type: Number, required: true },
    currentOccupancy: { type: Number, default: 0 },
    accessType: {
        type: String,
        enum: ['Guests Only', 'Guests and External', 'Members Only', 'Public'],
        default: 'Guests Only'
    },
    
    // Pricing (for external visitors)
    guestAccessFee: { type: Number, default: 0 },
    externalVisitorFee: { type: Number, default: 0 },
    
    // Operating hours
    operatingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    
    // Status
    status: {
        type: String,
        enum: ['Open', 'Closed', 'Under Maintenance', 'Reserved'],
        default: 'Open'
    },
    
    // Maintenance
    maintenanceSchedule: [{
        type: { type: String }, // e.g., "Cleaning", "Chemical Check", "Equipment Service"
        frequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'As Needed'] },
        lastPerformed: Date,
        nextDue: Date,
        assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
    }],
    
    // Safety
    lifeguardRequired: { type: Boolean, default: false },
    lifeguardSchedule: [{
        day: String,
        startTime: String,
        endTime: String,
        assignedLifeguard: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
    }],
    safetyEquipment: [{
        name: String,
        quantity: Number,
        lastChecked: Date
    }],
    
    // Additional services
    poolBar: { type: Boolean, default: false },
    towelService: { type: Boolean, default: false },
    equipmentRental: { type: Boolean, default: false },
    equipmentAvailable: [{
        name: String, // e.g., "Pool Noodles", "Beach Balls"
        quantity: Number,
        rentalFee: Number
    }],
    
    // Rules and regulations
    rules: [String],
    ageRestrictions: { type: String },
    
    // Statistics
    dailyVisits: { type: Number, default: 0 },
    peakHours: [{
        hour: String,
        averageOccupancy: Number
    }],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
PoolRecreationSchema.index({ type: 1, status: 1 });
PoolRecreationSchema.index({ status: 1 });

module.exports = mongoose.model('PoolRecreation', PoolRecreationSchema);
