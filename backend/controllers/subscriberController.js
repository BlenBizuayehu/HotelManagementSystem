// Fix: Provide full content for subscriberController.js
const Subscriber = require('../models/Subscriber');

exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ message: 'This email is already subscribed.' });
        }
        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();
        res.status(201).json({ message: 'Successfully subscribed!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
