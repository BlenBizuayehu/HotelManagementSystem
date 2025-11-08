
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const HousekeepingTask = require('../models/HousekeepingTask');
const AuditLog = require('../models/AuditLog');

// Helper function to log audit
const logAudit = async (userId, username, role, action, entityType, entityId, changes = {}, status = 'Success') => {
    try {
        await AuditLog.create({
            userId,
            username,
            role,
            action,
            entityType,
            entityId,
            changes,
            status,
            timestamp: new Date()
        });
    } catch (err) {
        console.error('Audit log error:', err);
    }
};

exports.getBookings = async (req, res) => {
    try {
        const { status, guestEmail, checkIn, checkOut, roomId } = req.query;
        const query = {};
        
        if (status) query.status = status;
        if (guestEmail) query.guestEmail = guestEmail;
        if (roomId) query.roomId = roomId;
        if (checkIn || checkOut) {
            query.$or = [];
            if (checkIn) {
                query.$or.push({ checkIn: { $lte: new Date(checkOut) }, checkOut: { $gte: new Date(checkIn) } });
            }
        }
        
        const bookings = await Booking.find(query)
            .populate('roomId', 'name roomNumber roomType')
            .populate('guestId', 'firstName lastName email loyaltyTier')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('roomId')
            .populate('guestId')
            .populate('corporateAccount');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createBooking = async (req, res) => {
    try {
        const bookingData = req.body;
        
        // Check if room is available
        if (bookingData.roomId) {
            const room = await Room.findById(bookingData.roomId);
            if (!room) {
                return res.status(404).json({ message: 'Room not found' });
            }
            if (!room.isAvailableForBooking) {
                return res.status(400).json({ message: 'Room is not available for booking' });
            }
            
            // Check for date conflicts
            const conflictingBookings = await Booking.find({
                roomId: bookingData.roomId,
                status: { $in: ['Confirmed', 'Checked In', 'Pending'] },
                $or: [
                    { checkIn: { $gte: new Date(bookingData.checkIn), $lt: new Date(bookingData.checkOut) } },
                    { checkOut: { $gt: new Date(bookingData.checkIn), $lte: new Date(bookingData.checkOut) } },
                    { checkIn: { $lte: new Date(bookingData.checkIn) }, checkOut: { $gte: new Date(bookingData.checkOut) } }
                ]
            });
            
            if (conflictingBookings.length > 0) {
                return res.status(400).json({ message: 'Room is already booked for these dates' });
            }
            
            // Calculate price using room's pricing method
            const pricePerNight = room.getCurrentPrice(bookingData.checkIn);
            const nights = Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24));
            bookingData.basePricePerNight = pricePerNight;
            bookingData.totalRoomCost = pricePerNight * nights;
            bookingData.roomNumber = room.roomNumber;
            bookingData.roomType = room.roomType;
        }
        
        // Find or create guest profile
        let guest = await Guest.findOne({ email: bookingData.guestEmail });
        if (!guest) {
            const nameParts = bookingData.guestName.split(' ');
            guest = await Guest.create({
                firstName: nameParts[0] || bookingData.guestName,
                lastName: nameParts.slice(1).join(' ') || '',
                email: bookingData.guestEmail,
                phone: bookingData.guestPhone
            });
        }
        bookingData.guestId = guest._id;
        
        // Calculate total amount
        const newBooking = new Booking(bookingData);
        newBooking.calculateTotal();
        
        // Apply corporate discount if applicable
        if (bookingData.corporateAccount) {
            const CorporateAccount = require('../models/CorporateAccount');
            const corporate = await CorporateAccount.findById(bookingData.corporateAccount);
            if (corporate && corporate.status === 'Active') {
                newBooking.corporateDiscount = (newBooking.totalRoomCost * corporate.roomDiscount) / 100;
                newBooking.calculateTotal();
            }
        }
        
        const savedBooking = await newBooking.save();
        
        // Update room status
        if (savedBooking.roomId) {
            const room = await Room.findById(savedBooking.roomId);
            room.updateStatusFromBooking(savedBooking.status);
            room.currentBooking = savedBooking._id;
            await room.save();
        }
        
        // Update guest statistics
        guest.totalBookings += 1;
        guest.lastBookingDate = new Date();
        await guest.save();
        
        // Log audit
        await logAudit(req.user?._id, req.user?.username, req.user?.role, 'CREATE_BOOKING', 'Booking', savedBooking._id, {}, 'Success');
        
        res.status(201).json(savedBooking);
    } catch (err) {
        await logAudit(req.user?._id, req.user?.username, req.user?.role, 'CREATE_BOOKING', 'Booking', null, {}, 'Failure');
        res.status(400).json({ message: err.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { status, roomId } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        const oldStatus = booking.status;
        booking.status = status;
        
        // Handle check-in
        if (status === 'Checked In') {
            booking.checkInTime = new Date();
            booking.checkedInBy = req.user._id;
            
            // Assign room if not already assigned
            if (roomId && !booking.roomId) {
                const room = await Room.findById(roomId);
                if (room && room.isAvailableForBooking) {
                    booking.roomId = roomId;
                    booking.roomNumber = room.roomNumber;
                    room.status = 'Occupied';
                    room.currentBooking = booking._id;
                    await room.save();
                }
            } else if (booking.roomId) {
                const room = await Room.findById(booking.roomId);
                if (room) {
                    room.status = 'Occupied';
                    room.currentBooking = booking._id;
                    await room.save();
                }
            }
        }
        
        // Handle check-out
        if (status === 'Checked Out') {
            booking.checkOutTime = new Date();
            booking.checkedOutBy = req.user._id;
            booking.calculateTotal(); // Recalculate with any additional charges
            
            // Generate invoice
            booking.invoiceGenerated = true;
            booking.invoiceGeneratedAt = new Date();
            
            // Update room status
            if (booking.roomId) {
                const room = await Room.findById(booking.roomId);
                if (room) {
                    room.updateStatusFromBooking(status);
                    await room.save();
                    
                    // Create housekeeping task
                    await HousekeepingTask.create({
                        roomId: booking.roomId,
                        roomNumber: booking.roomNumber,
                        taskType: 'Checkout Clean',
                        priority: 'High',
                        scheduledFor: new Date(),
                        bookingId: booking._id,
                        guestName: booking.guestName,
                        checkoutTime: booking.checkOutTime
                    });
                }
            }
            
            // Update guest statistics
            if (booking.guestId) {
                const guest = await Guest.findById(booking.guestId);
                if (guest) {
                    guest.totalNights += booking.nights || 0;
                    guest.totalSpent += booking.totalAmount || 0;
                    guest.lastVisitDate = new Date();
                    // Add loyalty points (1 point per dollar)
                    await guest.addLoyaltyPoints(Math.floor(booking.totalAmount || 0), 'Booking completed');
                    await guest.save();
                }
            }
            
            // Update room statistics
            if (booking.roomId) {
                const room = await Room.findById(booking.roomId);
                if (room) {
                    room.totalBookings += 1;
                    room.totalRevenue += booking.totalAmount || 0;
                    await room.save();
                }
            }
        }
        
        // Handle cancellation
        if (status === 'Cancelled') {
            booking.cancelledAt = new Date();
            booking.cancelledBy = req.body.cancelledBy || 'Hotel';
            booking.cancellationReason = req.body.cancellationReason;
            
            // Update room status
            if (booking.roomId) {
                const room = await Room.findById(booking.roomId);
                if (room) {
                    room.updateStatusFromBooking(status);
                    await room.save();
                }
            }
        }
        
        await booking.save();
        
        // Log audit
        await logAudit(req.user?._id, req.user?.username, req.user?.role, 'UPDATE_BOOKING_STATUS', 'Booking', booking._id, {
            before: { status: oldStatus },
            after: { status: booking.status }
        }, 'Success');
        
        res.json(booking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.assignRoom = async (req, res) => {
    try {
        const { roomId } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        
        if (!room.isAvailableForBooking) {
            return res.status(400).json({ message: 'Room is not available' });
        }
        
        // Check for conflicts
        const conflictingBookings = await Booking.find({
            roomId: roomId,
            status: { $in: ['Confirmed', 'Checked In', 'Pending'] },
            _id: { $ne: booking._id },
            $or: [
                { checkIn: { $gte: booking.checkIn, $lt: booking.checkOut } },
                { checkOut: { $gt: booking.checkIn, $lte: booking.checkOut } },
                { checkIn: { $lte: booking.checkIn }, checkOut: { $gte: booking.checkOut } }
            ]
        });
        
        if (conflictingBookings.length > 0) {
            return res.status(400).json({ message: 'Room has conflicting bookings' });
        }
        
        // Unassign previous room if exists
        if (booking.roomId) {
            const oldRoom = await Room.findById(booking.roomId);
            if (oldRoom) {
                oldRoom.status = 'Available';
                oldRoom.currentBooking = null;
                await oldRoom.save();
            }
        }
        
        // Assign new room
        booking.roomId = roomId;
        booking.roomNumber = room.roomNumber;
        room.status = booking.status === 'Checked In' ? 'Occupied' : 'Reserved';
        room.currentBooking = booking._id;
        await room.save();
        await booking.save();
        
        await logAudit(req.user?._id, req.user?.username, req.user?.role, 'ASSIGN_ROOM', 'Booking', booking._id, {
            roomId: roomId,
            roomNumber: room.roomNumber
        }, 'Success');
        
        res.json(booking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.addServiceCharge = async (req, res) => {
    try {
        const { serviceName, serviceId, quantity, unitPrice, date, chargeType, amount } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        if (chargeType === 'restaurant') {
            booking.restaurantCharges += amount || 0;
        } else if (chargeType === 'minibar') {
            booking.minibarCharges += amount || 0;
        } else if (chargeType === 'parking') {
            booking.parkingCharges += amount || 0;
        } else if (chargeType === 'other') {
            booking.otherCharges += amount || 0;
        } else if (serviceName) {
            // Add to additional services
            const totalPrice = (unitPrice || 0) * (quantity || 1);
            booking.additionalServices.push({
                serviceName,
                serviceId,
                quantity: quantity || 1,
                unitPrice: unitPrice || 0,
                totalPrice,
                date: date ? new Date(date) : new Date()
            });
        }
        
        booking.calculateTotal();
        await booking.save();
        
        res.json(booking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.generateInvoice = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('roomId')
            .populate('guestId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        booking.calculateTotal();
        booking.invoiceGenerated = true;
        booking.invoiceGeneratedAt = new Date();
        await booking.save();
        
        // Return invoice data
        const invoice = {
            invoiceNumber: booking.invoiceNumber,
            bookingReference: booking.bookingReference,
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            guestAddress: booking.guestAddress,
            roomNumber: booking.roomNumber,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            nights: booking.nights,
            items: [
                {
                    description: `Room - ${booking.nights} nights`,
                    quantity: booking.nights,
                    unitPrice: booking.basePricePerNight,
                    total: booking.totalRoomCost
                }
            ],
            subtotal: booking.totalRoomCost,
            tax: booking.taxAmount,
            total: booking.totalAmount,
            paymentStatus: booking.paymentStatus,
            generatedAt: booking.invoiceGeneratedAt
        };
        
        // Add additional services
        if (booking.additionalServices && booking.additionalServices.length > 0) {
            booking.additionalServices.forEach(service => {
                invoice.items.push({
                    description: service.serviceName,
                    quantity: service.quantity,
                    unitPrice: service.unitPrice,
                    total: service.totalPrice
                });
                invoice.subtotal += service.totalPrice;
            });
        }
        
        // Add other charges
        if (booking.restaurantCharges > 0) {
            invoice.items.push({
                description: 'Restaurant Charges',
                quantity: 1,
                unitPrice: booking.restaurantCharges,
                total: booking.restaurantCharges
            });
            invoice.subtotal += booking.restaurantCharges;
        }
        
        if (booking.minibarCharges > 0) {
            invoice.items.push({
                description: 'Minibar Charges',
                quantity: 1,
                unitPrice: booking.minibarCharges,
                total: booking.minibarCharges
            });
            invoice.subtotal += booking.minibarCharges;
        }
        
        if (booking.parkingCharges > 0) {
            invoice.items.push({
                description: 'Parking Charges',
                quantity: 1,
                unitPrice: booking.parkingCharges,
                total: booking.parkingCharges
            });
            invoice.subtotal += booking.parkingCharges;
        }
        
        res.json(invoice);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        // Update room status if assigned
        if (booking.roomId) {
            const room = await Room.findById(booking.roomId);
            if (room) {
                room.status = 'Available';
                room.currentBooking = null;
                await room.save();
            }
        }
        
        await Booking.findByIdAndDelete(req.params.id);
        
        await logAudit(req.user?._id, req.user?.username, req.user?.role, 'DELETE_BOOKING', 'Booking', booking._id, {}, 'Success');
        
        res.json({ message: 'Booking deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
