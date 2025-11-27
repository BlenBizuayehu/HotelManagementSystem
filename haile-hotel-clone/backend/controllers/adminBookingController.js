import Booking from '../models/Booking.js';

export const getAllBookings = async (req, res) => {
  try {
    const { status, checkIn, checkOut, guestEmail, roomId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (guestEmail) query['guest.email'] = { $regex: guestEmail, $options: 'i' };
    if (roomId) query.room = roomId;
    if (checkIn || checkOut) {
      query.$or = [];
      if (checkIn) {
        query.$or.push({ checkIn: { $gte: new Date(checkIn) } });
      }
      if (checkOut) {
        query.$or.push({ checkOut: { $lte: new Date(checkOut) } });
      }
    }

    const bookings = await Booking.find(query)
      .populate('room', 'name category price')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('room', 'name');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = 'cancelled';
    if (req.body.refund) {
      booking.paymentStatus = 'refunded';
    }
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
