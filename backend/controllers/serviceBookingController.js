
const ServiceBooking = require('../models/ServiceBooking');
const Service = require('../models/Service');

exports.getServiceBookings = async (req, res) => {
    try {
        const { serviceId, status, date, guestEmail } = req.query;
        let query = {};

        if (serviceId) query.service = serviceId;
        if (status) query.status = status;
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.bookingDate = { $gte: startDate, $lte: endDate };
        }
        if (guestEmail) query.guestEmail = guestEmail;

        const bookings = await ServiceBooking.find(query)
            .populate('service', 'name category price duration')
            .populate('assignedStaff', 'name')
            .sort({ bookingDate: 1, bookingTime: 1 });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getServiceBooking = async (req, res) => {
    try {
        const booking = await ServiceBooking.findById(req.params.id)
            .populate('service', 'name category price duration')
            .populate('assignedStaff', 'name');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createServiceBooking = async (req, res) => {
    try {
        const { service, guestName, guestEmail, guestPhone, bookingDate, bookingTime, assignedStaff, notes } = req.body;

        // Get service details
        const serviceDoc = await Service.findById(service);
        if (!serviceDoc) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Check if service is available
        if (!serviceDoc.isAvailable) {
            return res.status(400).json({ message: 'Service is currently unavailable' });
        }

        // Check for conflicts
        const conflictingBooking = await ServiceBooking.findOne({
            service,
            bookingDate: new Date(bookingDate),
            bookingTime,
            status: { $in: ['Upcoming', 'Confirmed'] }
        });

        if (conflictingBooking) {
            return res.status(400).json({ message: 'Time slot is already booked' });
        }

        const newBooking = new ServiceBooking({
            service,
            guestName,
            guestEmail,
            guestPhone,
            bookingDate: new Date(bookingDate),
            bookingTime,
            duration: serviceDoc.duration,
            assignedStaff: assignedStaff || (serviceDoc.assignedStaff && serviceDoc.assignedStaff[0]) || null,
            totalPrice: serviceDoc.price,
            notes
        });

        const savedBooking = await newBooking.save();
        const populatedBooking = await ServiceBooking.findById(savedBooking._id)
            .populate('service', 'name category price duration')
            .populate('assignedStaff', 'name');

        res.status(201).json(populatedBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateServiceBooking = async (req, res) => {
    try {
        const updatedBooking = await ServiceBooking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('service', 'name category price duration')
         .populate('assignedStaff', 'name');

        if (!updatedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(updatedBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateServiceBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await ServiceBooking.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: new Date() },
            { new: true }
        ).populate('service', 'name category price duration')
         .populate('assignedStaff', 'name');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteServiceBooking = async (req, res) => {
    try {
        const booking = await ServiceBooking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json({ message: 'Booking deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAvailableTimeSlots = async (req, res) => {
    try {
        const { serviceId, date } = req.query;
        
        if (!serviceId || !date) {
            return res.status(400).json({ message: 'Service ID and date are required' });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Get existing bookings for the date
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const existingBookings = await ServiceBooking.find({
            service: serviceId,
            bookingDate: { $gte: startDate, $lte: endDate },
            status: { $in: ['Upcoming', 'Confirmed'] }
        });

        // Generate available time slots (assuming 30-minute intervals)
        const availableSlots = [];
        const bookedTimes = existingBookings.map(b => b.bookingTime);

        // Default available hours (can be customized based on service.availableTimes)
        const startHour = 9;
        const endHour = 18;

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                if (!bookedTimes.includes(timeSlot)) {
                    availableSlots.push(timeSlot);
                }
            }
        }

        res.json({ availableSlots, serviceDuration: service.duration });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
