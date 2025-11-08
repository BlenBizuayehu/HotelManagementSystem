
const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: String, required: true, default: 'units' }, // e.g., 'pieces', 'kg', 'liters', 'boxes'
    stock: { type: Number, required: true, default: 0 },
    reorderThreshold: { type: Number, required: true, default: 10 },
    supplier: {
        name: String,
        contact: String,
        email: String
    },
    lastRestockDate: { type: Date },
    pricePerUnit: { type: Number, default: 0 },
    location: { type: String }, // Storage location
}, {
    timestamps: true
});

// Virtual for status
InventoryItemSchema.virtual('status').get(function() {
    if (this.stock <= 0) return 'Out of Stock';
    if (this.stock <= this.reorderThreshold) return 'Low Stock';
    return 'In Stock';
});

InventoryItemSchema.set('toJSON', { virtuals: true });
InventoryItemSchema.set('toObject', { virtuals: true });

// Index for search and filtering
InventoryItemSchema.index({ name: 'text', category: 'text' });
InventoryItemSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
