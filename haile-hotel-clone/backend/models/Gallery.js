import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: String,
  description: String,
  image: {
    url: String,
    alt: String,
  },
  category: {
    type: String,
    enum: ['rooms', 'restaurant', 'spa', 'events', 'general'],
    default: 'general',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Gallery', gallerySchema);
