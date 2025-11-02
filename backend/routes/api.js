// Fix: Provide full content for api.js
const express = require('express');
const router = express.Router();

const { getRooms, createRoom, updateRoom, deleteRoom, getAvailableRooms } = require('../controllers/roomController');
const { getBookings, createBooking, updateBookingStatus, deleteBooking } = require('../controllers/bookingController');
const { getEmployees, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } = require('../controllers/inventoryController');
const { getSchedules, createSchedule, deleteSchedule } = require('../controllers/scheduleController');
const { getAppointments, createAppointment, updateAppointment } = require('../controllers/spaGymController');
const { getWelcomeMessage, getAdminInsight } = require('../controllers/geminiController');
const { getServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { login } = require('../controllers/authController');
const { getTestimonials, createTestimonial } = require('../controllers/testimonialController');
const { getPosts, createPost, updatePost, deletePost } = require('../controllers/postController');
const { subscribe } = require('../controllers/subscriberController');

// Room routes
router.route('/rooms').get(getRooms).post(createRoom);
router.route('/rooms/available').get(getAvailableRooms);
router.route('/rooms/:id').put(updateRoom).delete(deleteRoom);

// Booking routes
router.route('/bookings').get(getBookings).post(createBooking);
router.route('/bookings/:id').delete(deleteBooking);
router.route('/bookings/:id/status').patch(updateBookingStatus);

// Employee routes
router.route('/employees').get(getEmployees).post(createEmployee);
router.route('/employees/:id').put(updateEmployee).delete(deleteEmployee);

// Inventory routes
router.route('/inventory').get(getInventory).post(createInventoryItem);
router.route('/inventory/:id').patch(updateInventoryItem).delete(deleteInventoryItem);

// Schedule routes
router.route('/schedules').get(getSchedules).post(createSchedule);
router.route('/schedules/:id').delete(deleteSchedule);

// Spa & Gym routes
router.route('/spa-gym').get(getAppointments).post(createAppointment);
router.route('/spa-gym/:id').patch(updateAppointment);

// Service routes
router.route('/services').get(getServices).post(createService);
router.route('/services/:id').put(updateService).delete(deleteService);

// News & Events (Posts) routes
router.route('/posts').get(getPosts).post(createPost);
router.route('/posts/:id').put(updatePost).delete(deletePost);

// Gemini AI routes
router.route('/gemini/welcome').post(getWelcomeMessage);
router.route('/gemini/insight').post(getAdminInsight);

// Auth routes
router.route('/auth/login').post(login);

// Testimonial routes
router.route('/testimonials').get(getTestimonials).post(createTestimonial);

// Subscriber routes
router.route('/subscribe').post(subscribe);

module.exports = router;