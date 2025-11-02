const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true, default: 'Elysian Hotel Staff' },
    imageUrl: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

module.exports = mongoose.model('Post', PostSchema);