
const Guest = require('../models/Guest');
const Booking = require('../models/Booking');
const AuditLog = require('../models/AuditLog');

const logAudit = async (userId, username, role, action, entityType, entityId, changes = {}, status = 'Success') => {
    try {
        await AuditLog.create({ userId, username, role, action, entityType, entityId, changes, status, timestamp: new Date() });
    } catch (err) {
        console.error('Audit log error:', err);
    }
};

exports.getGuests = async (req, res) => {
    try {
        const { search, loyaltyTier, status } = req.query;
        const query = {};
        
        if (loyaltyTier) query.loyaltyTier = loyaltyTier;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        const guests = await Guest.find(query).sort({ createdAt: -1 });
        res.json(guests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getGuest = async (req, res) => {
    try {
        const guest = await Guest.findById(req.params.id);
        if (!guest) return res.status(404).json({ message: 'Guest not found' });
        
        // Get booking history
        const bookings = await Booking.find({ guestId: guest._id })
            .populate('roomId', 'name roomNumber roomType')
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json({ guest, recentBookings: bookings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createGuest = async (req, res) => {
    try {
        const guest = await Guest.create(req.body);
        await logAudit(req.user?._id, req.user?.username, req.user?.role, 'CREATE_GUEST', 'Guest', guest._id, {}, 'Success');
        res.status(201).json(guest);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateGuest = async (req, res) => {
    try {
        const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!guest) return res.status(404).json({ message: 'Guest not found' });
        
        await logAudit(req.user?._id, req.user?.username, req.user?.role, 'UPDATE_GUEST', 'Guest', guest._id, {}, 'Success');
        res.json(guest);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getGuestBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ guestId: req.params.id })
            .populate('roomId', 'name roomNumber roomType')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addLoyaltyPoints = async (req, res) => {
    try {
        const { points, reason } = req.body;
        const guest = await Guest.findById(req.params.id);
        if (!guest) return res.status(404).json({ message: 'Guest not found' });
        
        await guest.addLoyaltyPoints(points, reason);
        res.json(guest);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.redeemPoints = async (req, res) => {
    try {
        const { points } = req.body;
        const guest = await Guest.findById(req.params.id);
        if (!guest) return res.status(404).json({ message: 'Guest not found' });
        
        await guest.redeemPoints(points);
        res.json(guest);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
