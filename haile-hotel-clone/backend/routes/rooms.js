import express from 'express';
import {
  getRooms,
  getRoom,
  checkAvailability,
} from '../controllers/roomController.js';

const router = express.Router();

router.get('/', getRooms);
router.get('/availability', checkAvailability);
router.get('/:slug', getRoom);

export default router;
