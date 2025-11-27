import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  itemCode: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['furniture', 'electronics', 'linens', 'cleaning-supplies', 'food-beverage', 'maintenance', 'office-supplies', 'other'],
    required: true,
  },
  description: String,
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  unit: {
    type: String,
    default: 'piece',
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  supplier: {
    name: String,
    contact: String,
    email: String,
  },
  location: {
    type: String, // e.g., 'Storage Room A', 'Kitchen', 'Housekeeping'
  },
  minStockLevel: {
    type: Number,
    default: 10,
  },
  maxStockLevel: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock', 'ordered'],
    default: 'in-stock',
  },
  lastRestocked: Date,
  notes: String,
}, {
  timestamps: true,
});

// Auto-generate item code
inventorySchema.pre('save', async function(next) {
  if (!this.itemCode) {
    const count = await mongoose.model('Inventory').countDocuments();
    this.itemCode = 'INV' + String(count + 1).padStart(5, '0');
  }
  
  // Update status based on quantity
  if (this.quantity <= 0) {
    this.status = 'out-of-stock';
  } else if (this.quantity <= this.minStockLevel) {
    this.status = 'low-stock';
  } else {
    this.status = 'in-stock';
  }
  
  next();
});

export default mongoose.model('Inventory', inventorySchema);
