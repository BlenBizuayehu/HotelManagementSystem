
const mongoose = require('mongoose');

const CorporateAccountSchema = new mongoose.Schema({
    companyName: { type: String, required: true, unique: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    
    // Company details
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    taxId: { type: String },
    industry: { type: String },
    
    // Account terms
    accountType: {
        type: String,
        enum: ['Standard', 'Preferred', 'VIP'],
        default: 'Standard'
    },
    creditLimit: { type: Number, default: 0 },
    paymentTerms: { type: String, default: 'Net 30' }, // e.g., "Net 30", "Net 60", "Due on Receipt"
    
    // Discounts
    roomDiscount: { type: Number, default: 0 }, // Percentage discount
    serviceDiscount: { type: Number, default: 0 },
    minimumStayDiscount: { type: Number, default: 0 }, // Additional discount for longer stays
    
    // Billing
    billingAddress: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    billingEmail: { type: String },
    paymentMethod: { type: String, enum: ['Invoice', 'Credit Card', 'Bank Transfer'], default: 'Invoice' },
    
    // Status
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended'],
        default: 'Active'
    },
    
    // Statistics
    totalBookings: { type: Number, default: 0 },
    totalNights: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    lastBookingDate: { type: Date },
    
    // Notes
    notes: { type: String },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
CorporateAccountSchema.index({ companyName: 1 });
CorporateAccountSchema.index({ email: 1 });
CorporateAccountSchema.index({ status: 1 });

module.exports = mongoose.model('CorporateAccount', CorporateAccountSchema);
