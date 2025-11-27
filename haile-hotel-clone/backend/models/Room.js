import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  size: {
    type: String, // e.g., "25 m²"
  },
  bedType: {
    type: String, // e.g., "King Bed", "Twin Beds"
  },
  amenities: [{
    type: String,
  }],
  images: [{
    url: String,
    alt: String,
  }],
  featured: {
    type: Boolean,
    default: false,
  },
  available: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    enum: ['standard', 'deluxe', 'suite', 'presidential'],
    default: 'standard',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Room', roomSchema);
