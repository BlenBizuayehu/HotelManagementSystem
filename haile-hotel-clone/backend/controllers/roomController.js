import Room from '../models/Room.js';

export const getRooms = async (req, res) => {
  try {
    const { category, featured, available, minPrice, maxPrice } = req.query;
    const query = {};

    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';
    if (available !== undefined) query.available = available === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const rooms = await Room.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ slug: req.params.slug });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut, roomId } = req.query;
    const Booking = (await import('../models/Booking.js')).default;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Find conflicting bookings
    const conflictingBookings = await Booking.find({
      room: roomId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate },
        },
      ],
    });

    const isAvailable = conflictingBookings.length === 0;
    res.json({ success: true, available: isAvailable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
