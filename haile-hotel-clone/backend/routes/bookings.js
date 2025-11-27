import express from 'express';
import {
  createBooking,
  getBooking,
  getBookingByReference,
} from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/reference/:reference', getBookingByReference);
router.get('/:id', getBooking);

export default router;
