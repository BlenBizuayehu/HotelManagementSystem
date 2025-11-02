// Fix: Provide full content for Subscriber.js
const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscriber', SubscriberSchema);
