import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

export const createBooking = async (req, res) => {
  try {
    const { room, guest, checkIn, checkOut, adults, children, specialRequests } = req.body;

    // Verify room exists
    const roomData = await Room.findById(room);
    if (!roomData) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check availability
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const conflictingBookings = await Booking.find({
      room,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate },
        },
      ],
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for the selected dates',
      });
    }

    // Calculate total price
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = roomData.price * nights;

    const booking = await Booking.create({
      room,
      guest,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults: adults || 1,
      children: children || 0,
      totalPrice,
      specialRequests,
    });

    await booking.populate('room');

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingByReference = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingReference: req.params.reference }).populate('room');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
