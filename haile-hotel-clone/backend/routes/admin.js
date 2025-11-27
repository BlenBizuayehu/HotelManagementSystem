import express from 'express';
import { adminProtect, requirePermission } from '../middleware/adminAuth.js';
import {
  adminLogin,
  getAdminProfile,
  getDashboardStats,
} from '../controllers/adminController.js';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js';
import {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  restockInventory,
} from '../controllers/inventoryController.js';
import {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  bulkCreateSchedules,
} from '../controllers/scheduleController.js';
import {
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/adminBookingController.js';
import {
  getAllRoomsAdmin,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/adminRoomController.js';

const router = express.Router();

// Admin Auth
router.post('/login', adminLogin);
router.get('/profile', adminProtect, getAdminProfile);
router.get('/dashboard/stats', adminProtect, getDashboardStats);

// Employees
router.get('/employees', adminProtect, requirePermission('manage-employees'), getEmployees);
router.get('/employees/:id', adminProtect, requirePermission('manage-employees'), getEmployee);
router.post('/employees', adminProtect, requirePermission('manage-employees'), createEmployee);
router.put('/employees/:id', adminProtect, requirePermission('manage-employees'), updateEmployee);
router.delete('/employees/:id', adminProtect, requirePermission('manage-employees'), deleteEmployee);

// Inventory
router.get('/inventory', adminProtect, requirePermission('manage-inventory'), getInventory);
router.get('/inventory/:id', adminProtect, requirePermission('manage-inventory'), getInventoryItem);
router.post('/inventory', adminProtect, requirePermission('manage-inventory'), createInventoryItem);
router.put('/inventory/:id', adminProtect, requirePermission('manage-inventory'), updateInventoryItem);
router.delete('/inventory/:id', adminProtect, requirePermission('manage-inventory'), deleteInventoryItem);
router.post('/inventory/:id/restock', adminProtect, requirePermission('manage-inventory'), restockInventory);

// Schedules
router.get('/schedules', adminProtect, requirePermission('manage-schedules'), getSchedules);
router.get('/schedules/:id', adminProtect, requirePermission('manage-schedules'), getSchedule);
router.post('/schedules', adminProtect, requirePermission('manage-schedules'), createSchedule);
router.post('/schedules/bulk', adminProtect, requirePermission('manage-schedules'), bulkCreateSchedules);
router.put('/schedules/:id', adminProtect, requirePermission('manage-schedules'), updateSchedule);
router.delete('/schedules/:id', adminProtect, requirePermission('manage-schedules'), deleteSchedule);

// Bookings (Admin)
router.get('/bookings', adminProtect, requirePermission('manage-bookings'), getAllBookings);
router.put('/bookings/:id/status', adminProtect, requirePermission('manage-bookings'), updateBookingStatus);
router.post('/bookings/:id/cancel', adminProtect, requirePermission('manage-bookings'), cancelBooking);

// Rooms (Admin)
router.get('/rooms', adminProtect, requirePermission('manage-rooms'), getAllRoomsAdmin);
router.post('/rooms', adminProtect, requirePermission('manage-rooms'), createRoom);
router.put('/rooms/:id', adminProtect, requirePermission('manage-rooms'), updateRoom);
router.delete('/rooms/:id', adminProtect, requirePermission('manage-rooms'), deleteRoom);

export default router;
