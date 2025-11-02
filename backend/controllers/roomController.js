
const Room = require('../models/Room');
const Booking = require('../models/Booking');

exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAvailableRooms = async (req, res) => {
    const { checkInDate, checkOutDate } = req.query;

    if (!checkInDate || !checkOutDate) {
        return res.status(400).json({ message: 'Check-in and check-out dates are required.' });
    }

    try {
        // Find bookings that conflict with the requested date range.
        // A conflict occurs if a booking's period overlaps with the desired stay period.
        const conflictingBookings = await Booking.find({
            itemType: 'Room', // Filter for room bookings only
            status: { $in: ['Confirmed', 'Pending'] },
            $or: [
                // Case 1: Existing booking starts during the new stay
                { checkIn: { $gte: checkInDate, $lt: checkOutDate } },
                // Case 2: Existing booking ends during the new stay
                { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
                // Case 3: Existing booking envelops the new stay
                { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } }
            ]
        });

        const bookedRoomNames = conflictingBookings.map(booking => booking.itemName);
        const uniqueBookedRoomNames = [...new Set(bookedRoomNames)];

        // Find all rooms that are NOT in the list of booked room names
        const availableRooms = await Room.find({ name: { $nin: uniqueBookedRoomNames } });

        res.json(availableRooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.createRoom = async (req, res) => {
    try {
        const newRoom = new Room(req.body);
        const savedRoom = await newRoom.save();
        res.status(201).json(savedRoom);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateRoom = async (req, res) => {
    try {
        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRoom) return res.status(404).json({ message: 'Room not found' });
        res.json(updatedRoom);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json({ message: 'Room deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
