
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    roomNumber: { type: String, required: true, unique: true }, // Specific room number (e.g., "101", "201A")
    roomType: { 
        type: String, 
        required: true,
        enum: ['Standard', 'Deluxe', 'Suite', 'Family', 'Executive', 'Presidential'],
        default: 'Standard'
    },
    description: { type: String, required: true },
    basePricePerNight: { type: Number, required: true },
    // Seasonal and dynamic pricing
    seasonalRates: [{
        name: String, // e.g., "Summer", "Holiday"
        startDate: Date,
        endDate: Date,
        multiplier: { type: Number, default: 1.0 } // Multiplier for base price
    }],
    weekendMultiplier: { type: Number, default: 1.2 }, // 20% increase on weekends
    capacity: { 
        type: Number, 
        required: true,
        min: 1
    },
    capacityType: {
        type: String,
        enum: ['Single', 'Double', 'Twin', 'Triple', 'Quad', 'Family'],
        default: 'Double'
    },
    imageUrls: [{ type: String }],
    amenities: [{ type: String }],
    // Room status tracking
    status: {
        type: String,
        enum: ['Available', 'Occupied', 'Reserved', 'Under Maintenance', 'Cleaning', 'Out of Order'],
        default: 'Available'
    },
    // Housekeeping status
    housekeepingStatus: {
        type: String,
        enum: ['Clean', 'Needs Cleaning', 'In Progress', 'Inspected'],
        default: 'Clean'
    },
    lastCleaned: { type: Date },
    nextCleaningDue: { type: Date },
    assignedHousekeeper: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Employee',
        default: null
    },
    // Maintenance tracking
    maintenanceRequests: [{
        issue: String,
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reportedAt: { type: Date, default: Date.now },
        priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
        status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
        resolvedAt: Date,
        notes: String
    }],
    isMaintenanceBlocked: { type: Boolean, default: false }, // Prevents booking if true
    // Room features
    floor: { type: Number },
    view: { type: String }, // e.g., "Ocean View", "Garden View", "City View"
    bedType: { type: String }, // e.g., "King", "Queen", "Twin Beds"
    smokingAllowed: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
    // Current booking reference
    currentBooking: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Booking',
        default: null
    },
    // Statistics
    totalBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviews: [{
        guestName: String,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        date: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Indexes for efficient queries
RoomSchema.index({ roomNumber: 1 });
RoomSchema.index({ status: 1, housekeepingStatus: 1 });
RoomSchema.index({ roomType: 1, status: 1 });
RoomSchema.index({ assignedHousekeeper: 1 });
RoomSchema.index({ isMaintenanceBlocked: 1 });

// Virtual to check if room is available for booking
RoomSchema.virtual('isAvailableForBooking').get(function() {
    return this.status === 'Available' && 
           !this.isMaintenanceBlocked && 
           this.housekeepingStatus === 'Clean';
});

// Method to calculate current price based on date
RoomSchema.methods.getCurrentPrice = function(checkInDate) {
    let price = this.basePricePerNight;
    const checkIn = new Date(checkInDate);
    const dayOfWeek = checkIn.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Apply weekend multiplier
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        price *= this.weekendMultiplier;
    }
    
    // Check for seasonal rates
    for (const season of this.seasonalRates) {
        if (checkIn >= season.startDate && checkIn <= season.endDate) {
            price *= season.multiplier;
            break;
        }
    }
    
    return Math.round(price * 100) / 100; // Round to 2 decimal places
};

// Method to update status based on booking
RoomSchema.methods.updateStatusFromBooking = function(bookingStatus) {
    if (bookingStatus === 'Confirmed' || bookingStatus === 'Pending') {
        this.status = 'Reserved';
    } else if (bookingStatus === 'Checked In') {
        this.status = 'Occupied';
    } else if (bookingStatus === 'Checked Out' || bookingStatus === 'Cancelled') {
        this.status = 'Available';
        this.housekeepingStatus = 'Needs Cleaning';
        this.currentBooking = null;
    }
};

RoomSchema.set('toJSON', { virtuals: true });
RoomSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Room', RoomSchema);
