import Admin from '../models/Admin.js';
import { generateToken } from '../utils/generateToken.js';

export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }],
    }).select('+password');

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id);

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const Booking = (await import('../models/Booking.js')).default;
    const Room = (await import('../models/Room.js')).default;
    const Employee = (await import('../models/Employee.js')).default;
    const Inventory = (await import('../models/Inventory.js')).default;

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalRooms,
      availableRooms,
      totalEmployees,
      activeEmployees,
      totalInventory,
      lowStockItems,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Room.countDocuments(),
      Room.countDocuments({ available: true }),
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'active' }),
      Inventory.countDocuments(),
      Inventory.countDocuments({ status: 'low-stock' }),
    ]);

    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('room', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
        },
        rooms: {
          total: totalRooms,
          available: availableRooms,
        },
        employees: {
          total: totalEmployees,
          active: activeEmployees,
        },
        inventory: {
          total: totalInventory,
          lowStock: lowStockItems,
        },
        recentBookings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
