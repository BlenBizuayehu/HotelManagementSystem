
const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
});

// Virtual for status
InventoryItemSchema.virtual('status').get(function() {
    if (this.stock <= 0) return 'Out of Stock';
    if (this.stock < 50) return 'Low Stock';
    return 'In Stock';
});

InventoryItemSchema.set('toJSON', { virtuals: true });
InventoryItemSchema.set('toObject', { virtuals: true });


module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
