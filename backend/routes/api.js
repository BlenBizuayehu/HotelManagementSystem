const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateLogin, validateBooking } = require('../middleware/validator');

const { getRooms, createRoom, updateRoom, deleteRoom, getAvailableRooms } = require('../controllers/roomController');
const { getBookings, createBooking, updateBookingStatus, deleteBooking } = require('../controllers/bookingController');
const { getEmployees, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } = require('../controllers/inventoryController');
const { getSchedules, createSchedule, deleteSchedule } = require('../controllers/scheduleController');
const { getAppointments, createAppointment, updateAppointment } = require('../controllers/spaGymController');
const { getWelcomeMessage, getAdminInsight } = require('../controllers/geminiController');
const { getServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { login, refreshToken, logout } = require('../controllers/authController');
const { getTestimonials, createTestimonial } = require('../controllers/testimonialController');
const { getPosts, createPost, updatePost, deletePost } = require('../controllers/postController');
const { subscribe } = require('../controllers/subscriberController');
const { createPaymentIntent, confirmPayment, processRefund, calculateBookingTotal, handleWebhook } = require('../controllers/paymentController');

// Public routes (no authentication required)
router.route('/rooms').get(getRooms);
router.route('/rooms/available').get(getAvailableRooms);
router.route('/services').get(getServices);
router.route('/posts').get(getPosts);
router.route('/testimonials').get(getTestimonials).post(createTestimonial);
router.route('/subscribe').post(subscribe);

// Auth routes (with rate limiting and validation)
router.route('/auth/login').post(authLimiter, validateLogin, login);
router.route('/auth/refresh').post(refreshToken);
router.route('/auth/logout').post(protect, logout);

// Protected routes (authentication required)
router.route('/rooms').post(protect, createRoom);
router.route('/rooms/:id').put(protect, updateRoom).delete(protect, deleteRoom);

router.route('/bookings').get(protect, getBookings).post(validateBooking, createBooking);
router.route('/bookings/:id').delete(protect, deleteBooking);
router.route('/bookings/:id/status').patch(protect, updateBookingStatus);

router.route('/services').post(protect, createService);
router.route('/services/:id').put(protect, updateService).delete(protect, deleteService);

router.route('/schedules').get(protect, getSchedules).post(protect, createSchedule);
router.route('/schedules/:id').delete(protect, deleteSchedule);

router.route('/spa-gym').get(protect, getAppointments).post(protect, createAppointment);
router.route('/spa-gym/:id').patch(protect, updateAppointment);

router.route('/posts').post(protect, createPost);
router.route('/posts/:id').put(protect, updatePost).delete(protect, deletePost);

router.route('/gemini/welcome').post(protect, getWelcomeMessage);
router.route('/gemini/insight').post(protect, getAdminInsight);

// Admin only routes
router.route('/employees').get(protect, authorize('Admin'), getEmployees).post(protect, authorize('Admin'), createEmployee);
router.route('/employees/:id').put(protect, authorize('Admin'), updateEmployee).delete(protect, authorize('Admin'), deleteEmployee);

router.route('/inventory').get(protect, authorize('Admin'), getInventory).post(protect, authorize('Admin'), createInventoryItem);
router.route('/inventory/:id').patch(protect, authorize('Admin'), updateInventoryItem).delete(protect, authorize('Admin'), deleteInventoryItem);

// Payment routes
router.route('/payments/intent').post(protect, createPaymentIntent);
router.route('/payments/confirm').post(protect, confirmPayment);
router.route('/payments/refund').post(protect, authorize('Admin'), processRefund);
router.route('/payments/calculate').post(calculateBookingTotal);
// Webhook needs raw body, handled differently in server.js
router.route('/payments/webhook').post(handleWebhook);

module.exports = router;