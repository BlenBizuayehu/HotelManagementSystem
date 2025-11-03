const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Service = require('../models/Service');

// Create payment intent for booking
exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId, amount, currency = 'usd' } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and amount are required',
      });
    }

    // Verify booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        bookingId: bookingId.toString(),
        guestEmail: booking.guestEmail,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message,
    });
  }
};

// Confirm payment and update booking
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    if (!paymentIntentId || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and booking ID are required',
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${paymentIntent.status}`,
      });
    }

    // Update booking status
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'Confirmed', paymentIntentId, paidAt: new Date() },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      booking,
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message,
    });
  }
};

// Process refund
exports.processRefund = async (req, res) => {
  try {
    const { bookingId, amount, reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking || !booking.paymentIntentId) {
      return res.status(404).json({
        success: false,
        message: 'Booking or payment not found',
      });
    }

    // Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);
    
    if (!paymentIntent.charges.data.length) {
      return res.status(400).json({
        success: false,
        message: 'No charge found for this payment',
      });
    }

    const chargeId = paymentIntent.charges.data[0].id;
    const refundAmount = amount ? Math.round(amount * 100) : undefined; // Full refund if no amount specified

    // Create refund
    const refund = await stripe.refunds.create({
      charge: chargeId,
      amount: refundAmount,
      reason: reason || 'requested_by_customer',
      metadata: {
        bookingId: bookingId.toString(),
      },
    });

    // Update booking status if full refund
    if (!refundAmount || refundAmount === paymentIntent.amount) {
      await Booking.findByIdAndUpdate(bookingId, {
        status: 'Cancelled',
        refundedAt: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message,
    });
  }
};

// Webhook handler for Stripe events
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const bookingId = paymentIntent.metadata.bookingId;
      
      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
          status: 'Confirmed',
          paymentIntentId: paymentIntent.id,
          paidAt: new Date(),
        });
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      const failedBookingId = failedPayment.metadata.bookingId;
      
      if (failedBookingId) {
        await Booking.findByIdAndUpdate(failedBookingId, {
          status: 'Pending',
        });
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Calculate booking total
exports.calculateBookingTotal = async (req, res) => {
  try {
    const { itemId, itemType, checkIn, checkOut } = req.body;

    if (!itemId || !itemType) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and type are required',
      });
    }

    let item;
    let total = 0;

    if (itemType === 'Room') {
      item = await Room.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Room not found',
        });
      }

      if (checkIn && checkOut) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        total = item.pricePerNight * nights;
      } else {
        total = item.pricePerNight;
      }
    } else if (itemType === 'Service') {
      item = await Service.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Service not found',
        });
      }
      total = item.price;
    }

    res.status(200).json({
      success: true,
      total,
      currency: 'usd',
    });
  } catch (error) {
    console.error('Calculate total error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate total',
      error: error.message,
    });
  }
};
