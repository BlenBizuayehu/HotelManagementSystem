
const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema({
    // Basic information
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date },
    nationality: { type: String },
    idType: { type: String, enum: ['Passport', 'ID Card', 'Driver License', 'Other'] },
    idNumber: { type: String },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    
    // Preferences
    preferences: {
        roomType: String, // Preferred room type
        bedType: String, // Preferred bed type
        floor: String, // Preferred floor
        smokingPreference: { type: String, enum: ['Smoking', 'Non-Smoking', 'No Preference'], default: 'No Preference' },
        dietaryRestrictions: [String],
        accessibilityNeeds: [String],
        language: { type: String, default: 'English' },
        specialRequests: String
    },
    
    // Loyalty program
    loyaltyPoints: { type: Number, default: 0 },
    loyaltyTier: { 
        type: String, 
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
        default: 'Bronze'
    },
    membershipNumber: { type: String, unique: true },
    membershipStartDate: { type: Date },
    pointsEarned: { type: Number, default: 0 },
    pointsRedeemed: { type: Number, default: 0 },
    
    // Booking history
    totalBookings: { type: Number, default: 0 },
    totalNights: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastBookingDate: { type: Date },
    lastVisitDate: { type: Date },
    
    // Communication preferences
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    marketingEmails: { type: Boolean, default: false },
    
    // Guest status
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Blacklisted'],
        default: 'Active'
    },
    blacklistReason: { type: String },
    
    // Notes and tags
    tags: [String], // e.g., "VIP", "Corporate", "Frequent Guest"
    notes: { type: String }, // Internal notes about the guest
    
    // Payment methods (tokenized)
    savedPaymentMethods: [{
        type: { type: String, enum: ['Card', 'Bank Account'] },
        last4: String, // Last 4 digits
        brand: String, // e.g., "Visa", "Mastercard"
        expiryMonth: Number,
        expiryYear: Number,
        isDefault: { type: Boolean, default: false },
        token: { type: String, select: false } // Encrypted token
    }],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to generate membership number and update tier
GuestSchema.pre('save', function(next) {
    // Generate membership number if not exists
    if (!this.membershipNumber) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.membershipNumber = `MEM-${timestamp}-${random}`;
    }
    
    // Update loyalty tier based on points
    if (this.loyaltyPoints >= 10000) {
        this.loyaltyTier = 'Diamond';
    } else if (this.loyaltyPoints >= 5000) {
        this.loyaltyTier = 'Platinum';
    } else if (this.loyaltyPoints >= 2000) {
        this.loyaltyTier = 'Gold';
    } else if (this.loyaltyPoints >= 500) {
        this.loyaltyTier = 'Silver';
    } else {
        this.loyaltyTier = 'Bronze';
    }
    
    this.updatedAt = new Date();
    next();
});

// Method to add loyalty points
GuestSchema.methods.addLoyaltyPoints = function(points, reason) {
    this.loyaltyPoints += points;
    this.pointsEarned += points;
    // Points are typically 1 point per dollar spent
    return this.save();
};

// Method to redeem loyalty points
GuestSchema.methods.redeemPoints = function(points) {
    if (this.loyaltyPoints >= points) {
        this.loyaltyPoints -= points;
        this.pointsRedeemed += points;
        return this.save();
    }
    throw new Error('Insufficient loyalty points');
};

// Indexes
GuestSchema.index({ email: 1 });
GuestSchema.index({ phone: 1 });
GuestSchema.index({ membershipNumber: 1 });
GuestSchema.index({ loyaltyTier: 1 });
GuestSchema.index({ status: 1 });
GuestSchema.index({ lastName: 1, firstName: 1 });

module.exports = mongoose.model('Guest', GuestSchema);
