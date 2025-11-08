
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    // Guest information
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    guestPhone: { type: String, required: true },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', default: null }, // Reference to Guest profile if exists
    guestIdNumber: { type: String }, // ID/Passport number for registration
    guestAddress: { type: String },
    numberOfGuests: { type: Number, required: true, min: 1 },
    numberOfAdults: { type: Number, default: 1 },
    numberOfChildren: { type: Number, default: 0 },
    
    // Booking details
    itemName: { type: String, required: true }, // Room name or service name
    itemType: { type: String, required: true, enum: ['Room', 'Service'] },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null }, // Specific room assigned
    roomNumber: { type: String }, // Room number assigned
    roomType: { type: String }, // Room type for filtering
    
    // Dates
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    checkInTime: { type: Date }, // Actual check-in time
    checkOutTime: { type: Date }, // Actual check-out time
    nights: { type: Number }, // Calculated number of nights
    
    // Booking status
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled', 'No Show'],
        default: 'Pending' 
    },
    bookingSource: {
        type: String,
        enum: ['Online', 'Front Desk', 'Phone', 'Email', 'Corporate', 'OTA'],
        default: 'Online'
    },
    bookingReference: { type: String, unique: true }, // Unique booking reference number
    
    // Pricing
    basePricePerNight: { type: Number, required: true },
    totalRoomCost: { type: Number, required: true }, // Room cost before taxes/services
    taxRate: { type: Number, default: 0.10 }, // 10% tax default
    taxAmount: { type: Number, default: 0 },
    serviceCharges: { type: Number, default: 0 }, // Additional service charges
    discountAmount: { type: Number, default: 0 },
    discountCode: { type: String }, // Promo/coupon code
    totalAmount: { type: Number, required: true }, // Final amount after all calculations
    depositAmount: { type: Number, default: 0 },
    balanceAmount: { type: Number }, // Remaining balance
    
    // Payment information
    paymentIntentId: { type: String },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'Online', 'Corporate Account', 'Loyalty Points'], default: 'Online' },
    paymentStatus: { type: String, enum: ['Pending', 'Partial', 'Paid', 'Refunded'], default: 'Pending' },
    currency: { type: String, default: 'USD' },
    paidAt: { type: Date },
    refundedAt: { type: Date },
    refundAmount: { type: Number, default: 0 },
    
    // Additional services and charges
    additionalServices: [{
        serviceName: String,
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
        quantity: { type: Number, default: 1 },
        unitPrice: Number,
        totalPrice: Number,
        date: Date
    }],
    restaurantCharges: { type: Number, default: 0 },
    minibarCharges: { type: Number, default: 0 },
    parkingCharges: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    
    // Group/Corporate booking
    isGroupBooking: { type: Boolean, default: false },
    groupName: { type: String },
    corporateAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'CorporateAccount', default: null },
    corporateDiscount: { type: Number, default: 0 },
    
    // Policies
    cancellationPolicy: { type: String, default: 'Standard' },
    cancellationDeadline: { type: Date }, // Last date for free cancellation
    cancellationFee: { type: Number, default: 0 },
    noShowFee: { type: Number, default: 0 },
    cancellationReason: { type: String },
    cancelledBy: { type: String }, // 'Guest' or 'Hotel'
    cancelledAt: { type: Date },
    
    // Special requests and preferences
    specialRequests: { type: String },
    preferences: {
        roomLocation: String, // e.g., "High floor", "Near elevator"
        bedType: String,
        smokingPreference: String,
        accessibilityNeeds: String
    },
    
    // Invoice
    invoiceNumber: { type: String, unique: true },
    invoiceGenerated: { type: Boolean, default: false },
    invoiceGeneratedAt: { type: Date },
    
    // Notes and internal comments
    notes: { type: String }, // Internal notes
    guestNotes: { type: String }, // Notes visible to guest
    
    // Check-in/Check-out details
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    checkedOutBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    earlyCheckIn: { type: Boolean, default: false },
    lateCheckOut: { type: Boolean, default: false },
    
    // Housekeeping
    housekeepingNotes: { type: String },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to calculate nights and generate booking reference
BookingSchema.pre('save', function(next) {
    if (this.checkIn && this.checkOut) {
        const nights = Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
        this.nights = nights;
    }
    
    // Generate booking reference if not exists
    if (!this.bookingReference) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.bookingReference = `BK-${timestamp}-${random}`;
    }
    
    // Generate invoice number if booking is confirmed/checked in
    if (!this.invoiceNumber && (this.status === 'Confirmed' || this.status === 'Checked In' || this.status === 'Checked Out')) {
        const timestamp = Date.now().toString(36).toUpperCase();
        this.invoiceNumber = `INV-${timestamp}`;
    }
    
    this.updatedAt = new Date();
    next();
});

// Method to calculate total amount
BookingSchema.methods.calculateTotal = function() {
    let total = this.totalRoomCost || 0;
    
    // Add service charges
    total += this.serviceCharges || 0;
    
    // Add additional services
    if (this.additionalServices && this.additionalServices.length > 0) {
        const servicesTotal = this.additionalServices.reduce((sum, service) => {
            return sum + (service.totalPrice || 0);
        }, 0);
        total += servicesTotal;
    }
    
    // Add other charges
    total += (this.restaurantCharges || 0);
    total += (this.minibarCharges || 0);
    total += (this.parkingCharges || 0);
    total += (this.otherCharges || 0);
    
    // Apply discounts
    total -= (this.discountAmount || 0);
    total -= (this.corporateDiscount || 0);
    
    // Calculate tax
    this.taxAmount = total * (this.taxRate || 0);
    total += this.taxAmount;
    
    this.totalAmount = Math.round(total * 100) / 100;
    this.balanceAmount = this.totalAmount - (this.depositAmount || 0);
    
    return this.totalAmount;
};

// Indexes
BookingSchema.index({ bookingReference: 1 });
BookingSchema.index({ guestEmail: 1 });
BookingSchema.index({ guestId: 1 });
BookingSchema.index({ roomId: 1 });
BookingSchema.index({ checkIn: 1, checkOut: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ invoiceNumber: 1 });
BookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', BookingSchema);
