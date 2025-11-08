
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const AuditLog = require('../models/AuditLog');

const logAudit = async (userId, username, role, action, entityType, entityId, changes = {}, status = 'Success') => {
    try {
        await AuditLog.create({ userId, username, role, action, entityType, entityId, changes, status, timestamp: new Date() });
    } catch (err) {
        console.error('Audit log error:', err);
    }
};

exports.getRooms = async (req, res) => {
    try {
        const { status, roomType, housekeepingStatus, floor } = req.query;
        const query = {};
        
        if (status) query.status = status;
        if (roomType) query.roomType = roomType;
        if (housekeepingStatus) query.housekeepingStatus = housekeepingStatus;
        if (floor) query.floor = parseInt(floor);
        
        const rooms = await Room.find(query)
            .populate('assignedHousekeeper', 'name')
            .populate('currentBooking', 'guestName checkIn checkOut status')
            .sort({ roomNumber: 1 });
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate('assignedHousekeeper', 'name department')
            .populate('currentBooking')
            .populate('maintenanceRequests.reportedBy', 'username');
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAvailableRooms = async (req, res) => {
    const { checkInDate, checkOutDate, roomType, capacity } = req.query;

    if (!checkInDate || !checkOutDate) {
        return res.status(400).json({ message: 'Check-in and check-out dates are required.' });
    }

    try {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        
        // Find bookings that conflict with the requested date range
        const conflictingBookings = await Booking.find({
            itemType: 'Room',
            status: { $in: ['Confirmed', 'Checked In', 'Pending'] },
            $or: [
                { checkIn: { $gte: checkIn, $lt: checkOut } },
                { checkOut: { $gt: checkIn, $lte: checkOut } },
                { checkIn: { $lte: checkIn }, checkOut: { $gte: checkOut } }
            ]
        });

        const bookedRoomIds = conflictingBookings.map(booking => booking.roomId).filter(Boolean);
        
        // Build query for available rooms
        const query = {
            _id: { $nin: bookedRoomIds },
            status: { $in: ['Available', 'Reserved'] },
            housekeepingStatus: 'Clean',
            isMaintenanceBlocked: false
        };
        
        if (roomType) query.roomType = roomType;
        if (capacity) query.capacity = { $gte: parseInt(capacity) };
        
        const availableRooms = await Room.find(query);
        
        // Calculate prices for each room
        const roomsWithPrices = availableRooms.map(room => {
            const price = room.getCurrentPrice(checkInDate);
            return {
                ...room.toObject(),
                currentPricePerNight: price
            };
        });
        
        res.json(roomsWithPrices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createRoom = async (req, res) => {
    try {
        const newRoom = new Room(req.body);
        const savedRoom = await newRoom.save();
        
        await logAudit(req.user?._id, req.user?.username, req.user?.role, 'CREATE_ROOM', 'Room', savedRoom._id, {}, 'Success');
        res.status(201).json(savedRoom);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        
        const oldData = { ...room.toObject() };
        Object.assign(room, req.body);
        const updatedRoom = await room.save();
        
        await logAudit(req.user?._id, req.user?.username, req.user?.role, 'UPDATE_ROOM', 'Room', updatedRoom._id, {
            before: oldData,
            after: updatedRoom.toObject()
        }, 'Success');
        
        res.json(updatedRoom);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateRoomStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        
        const oldStatus = room.status;
        room.status = status;
        await room.save();
        
        await logAudit(req.user?._id, req.user?.username, req.user?.role, 'UPDATE_ROOM_STATUS', 'Room', room._id, {
            before: { status: oldStatus },
            after: { status: room.status }
        }, 'Success');
        
        res.json(room);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateHousekeepingStatus = async (req, res) => {
    try {
        const { housekeepingStatus, assignedHousekeeper } = req.body;
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        
        room.housekeepingStatus = housekeepingStatus;
        if (housekeepingStatus === 'Clean' || housekeepingStatus === 'Inspected') {
            room.lastCleaned = new Date();
        }
        if (assignedHousekeeper) {
            room.assignedHousekeeper = assignedHousekeeper;
        }
        await room.save();
        
        res.json(room);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.addMaintenanceRequest = async (req, res) => {
    try {
        const { issue, priority, notes } = req.body;
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        
        room.maintenanceRequests.push({
            issue,
            priority: priority || 'Medium',
            reportedBy: req.user._id,
            reportedAt: new Date(),
            notes,
            status: 'Open'
        });
        
        // Block room from booking if priority is High or Urgent
        if (priority === 'High' || priority === 'Urgent') {
            room.isMaintenanceBlocked = true;
            room.status = 'Under Maintenance';
        }
        
        await room.save();
        res.json(room);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateMaintenanceRequest = async (req, res) => {
    try {
        const { requestId, status, notes } = req.body;
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        
        const request = room.maintenanceRequests.id(requestId);
        if (!request) return res.status(404).json({ message: 'Maintenance request not found' });
        
        request.status = status;
        if (notes) request.notes = (request.notes || '') + '\n' + notes;
        if (status === 'Resolved' || status === 'Closed') {
            request.resolvedAt = new Date();
        }
        
        // Check if all maintenance requests are resolved
        const allResolved = room.maintenanceRequests.every(req => 
            req.status === 'Resolved' || req.status === 'Closed'
        );
        
        if (allResolved && room.status === 'Under Maintenance') {
            room.isMaintenanceBlocked = false;
            room.status = 'Available';
        }
        
        await room.save();
        res.json(room);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        
        // Check if room has active bookings
        const activeBookings = await Booking.countDocuments({
            roomId: room._id,
            status: { $in: ['Confirmed', 'Checked In', 'Pending'] }
        });
        
        if (activeBookings > 0) {
            return res.status(400).json({ message: 'Cannot delete room with active bookings' });
        }
        
        await Room.findByIdAndDelete(req.params.id);
        
        await logAudit(req.user?._id, req.user?.username, req.user?.role, 'DELETE_ROOM', 'Room', room._id, {}, 'Success');
        res.json({ message: 'Room deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
