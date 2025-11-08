
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Employee = require('../models/Employee');
const InventoryItem = require('../models/InventoryItem');
const Service = require('../models/Service');
const ServiceBooking = require('../models/ServiceBooking');
const Guest = require('../models/Guest');

exports.getOccupancyReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        const end = endDate ? new Date(endDate) : new Date();
        
        // Get total rooms
        const totalRooms = await Room.countDocuments();
        
        // Get bookings in date range
        const bookings = await Booking.find({
            checkIn: { $lte: end },
            checkOut: { $gte: start },
            status: { $in: ['Confirmed', 'Checked In', 'Checked Out'] }
        });
        
        // Calculate occupancy by day
        const occupancyByDay = {};
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        for (let i = 0; i < days; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            const occupiedRooms = bookings.filter(booking => {
                const checkIn = new Date(booking.checkIn);
                const checkOut = new Date(booking.checkOut);
                return date >= checkIn && date < checkOut;
            }).length;
            
            occupancyByDay[dateStr] = {
                occupied: occupiedRooms,
                available: totalRooms - occupiedRooms,
                occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms * 100).toFixed(2) : 0
            };
        }
        
        // Calculate overall statistics
        const totalNights = bookings.reduce((sum, booking) => {
            const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));
            return sum + nights;
        }, 0);
        
        const averageOccupancy = days > 0 ? (totalNights / (totalRooms * days) * 100).toFixed(2) : 0;
        
        res.json({
            period: { start, end },
            totalRooms,
            averageOccupancy: parseFloat(averageOccupancy),
            occupancyByDay,
            totalBookings: bookings.length,
            totalNights
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getRevenueReport = async (req, res) => {
    try {
        const { startDate, endDate, groupBy } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        const end = endDate ? new Date(endDate) : new Date();
        const group = groupBy || 'day'; // day, week, month
        
        const bookings = await Booking.find({
            checkOut: { $gte: start, $lte: end },
            status: { $in: ['Checked Out', 'Confirmed'] }
        });
        
        const revenueByPeriod = {};
        let totalRevenue = 0;
        let totalRoomRevenue = 0;
        let totalServiceRevenue = 0;
        
        bookings.forEach(booking => {
            const date = new Date(booking.checkOut);
            let key;
            
            if (group === 'day') {
                key = date.toISOString().split('T')[0];
            } else if (group === 'week') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
            } else if (group === 'month') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }
            
            if (!revenueByPeriod[key]) {
                revenueByPeriod[key] = {
                    roomRevenue: 0,
                    serviceRevenue: 0,
                    totalRevenue: 0,
                    bookings: 0
                };
            }
            
            revenueByPeriod[key].roomRevenue += booking.totalRoomCost || 0;
            revenueByPeriod[key].serviceRevenue += (booking.restaurantCharges || 0) + 
                                                   (booking.minibarCharges || 0) + 
                                                   (booking.parkingCharges || 0) +
                                                   (booking.additionalServices?.reduce((sum, s) => sum + (s.totalPrice || 0), 0) || 0);
            revenueByPeriod[key].totalRevenue += booking.totalAmount || 0;
            revenueByPeriod[key].bookings += 1;
            
            totalRevenue += booking.totalAmount || 0;
            totalRoomRevenue += booking.totalRoomCost || 0;
            totalServiceRevenue += (booking.restaurantCharges || 0) + 
                                   (booking.minibarCharges || 0) + 
                                   (booking.parkingCharges || 0) +
                                   (booking.additionalServices?.reduce((sum, s) => sum + (s.totalPrice || 0), 0) || 0);
        });
        
        // Revenue by room type
        const revenueByRoomType = {};
        bookings.forEach(booking => {
            if (booking.roomType) {
                if (!revenueByRoomType[booking.roomType]) {
                    revenueByRoomType[booking.roomType] = { revenue: 0, bookings: 0 };
                }
                revenueByRoomType[booking.roomType].revenue += booking.totalAmount || 0;
                revenueByRoomType[booking.roomType].bookings += 1;
            }
        });
        
        res.json({
            period: { start, end },
            totalRevenue,
            totalRoomRevenue,
            totalServiceRevenue,
            revenueByPeriod,
            revenueByRoomType,
            totalBookings: bookings.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getStaffPerformanceReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        const end = endDate ? new Date(endDate) : new Date();
        
        const employees = await Employee.find({ status: 'Active' });
        const performanceData = [];
        
        for (const employee of employees) {
            // Get housekeeping tasks completed
            const HousekeepingTask = require('../models/HousekeepingTask');
            const tasks = await HousekeepingTask.find({
                assignedTo: employee._id,
                completedAt: { $gte: start, $lte: end },
                status: 'Completed'
            });
            
            // Calculate metrics
            const totalTasks = tasks.length;
            const avgDuration = tasks.length > 0 
                ? tasks.reduce((sum, t) => sum + (t.actualDuration || 0), 0) / tasks.length 
                : 0;
            
            performanceData.push({
                employeeId: employee._id,
                name: employee.name,
                department: employee.department,
                totalTasks,
                avgDuration: Math.round(avgDuration),
                performanceRating: employee.performanceMetrics?.rating || 0
            });
        }
        
        res.json({
            period: { start, end },
            performanceData
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getInventoryReport = async (req, res) => {
    try {
        const inventory = await InventoryItem.find();
        
        const lowStockItems = inventory.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock');
        const totalValue = inventory.reduce((sum, item) => sum + ((item.stock || 0) * (item.pricePerUnit || 0)), 0);
        
        const consumptionByCategory = {};
        inventory.forEach(item => {
            if (!consumptionByCategory[item.category]) {
                consumptionByCategory[item.category] = {
                    items: 0,
                    totalStock: 0,
                    totalValue: 0,
                    lowStockCount: 0
                };
            }
            consumptionByCategory[item.category].items += 1;
            consumptionByCategory[item.category].totalStock += item.stock || 0;
            consumptionByCategory[item.category].totalValue += (item.stock || 0) * (item.pricePerUnit || 0);
            if (item.status === 'Low Stock' || item.status === 'Out of Stock') {
                consumptionByCategory[item.category].lowStockCount += 1;
            }
        });
        
        res.json({
            totalItems: inventory.length,
            lowStockItems: lowStockItems.length,
            totalValue,
            consumptionByCategory,
            lowStockItems: lowStockItems.map(item => ({
                name: item.name,
                category: item.category,
                stock: item.stock,
                reorderThreshold: item.reorderThreshold,
                status: item.status
            }))
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getServiceUsageReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        const end = endDate ? new Date(endDate) : new Date();
        
        const serviceBookings = await ServiceBooking.find({
            bookingDate: { $gte: start, $lte: end },
            status: { $in: ['Completed', 'Upcoming'] }
        }).populate('service', 'name category price');
        
        const usageByService = {};
        let totalRevenue = 0;
        
        serviceBookings.forEach(booking => {
            const serviceName = booking.service?.name || 'Unknown';
            if (!usageByService[serviceName]) {
                usageByService[serviceName] = {
                    bookings: 0,
                    revenue: 0,
                    category: booking.service?.category || 'Other'
                };
            }
            usageByService[serviceName].bookings += 1;
            usageByService[serviceName].revenue += booking.totalPrice || 0;
            totalRevenue += booking.totalPrice || 0;
        });
        
        // Usage by category
        const usageByCategory = {};
        Object.values(usageByService).forEach(service => {
            if (!usageByCategory[service.category]) {
                usageByCategory[service.category] = { bookings: 0, revenue: 0 };
            }
            usageByCategory[service.category].bookings += service.bookings;
            usageByCategory[service.category].revenue += service.revenue;
        });
        
        res.json({
            period: { start, end },
            totalBookings: serviceBookings.length,
            totalRevenue,
            usageByService,
            usageByCategory
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Today's check-ins
        const todayCheckIns = await Booking.countDocuments({
            checkIn: { $gte: today, $lt: tomorrow },
            status: { $in: ['Confirmed', 'Pending'] }
        });
        
        // Today's check-outs
        const todayCheckOuts = await Booking.countDocuments({
            checkOut: { $gte: today, $lt: tomorrow },
            status: { $in: ['Checked In', 'Confirmed'] }
        });
        
        // Current occupancy
        const currentOccupancy = await Booking.countDocuments({
            status: 'Checked In'
        });
        
        // Total rooms
        const totalRooms = await Room.countDocuments();
        
        // Available rooms
        const availableRooms = await Room.countDocuments({
            status: 'Available',
            housekeepingStatus: 'Clean',
            isMaintenanceBlocked: false
        });
        
        // Pending bookings
        const pendingBookings = await Booking.countDocuments({
            status: 'Pending'
        });
        
        // Today's revenue
        const todayBookings = await Booking.find({
            checkOut: { $gte: today, $lt: tomorrow },
            status: 'Checked Out'
        });
        const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        
        // Low stock items
        const lowStockItems = await InventoryItem.countDocuments({
            $or: [
                { stock: { $lte: 0 } },
                { $expr: { $lte: ['$stock', '$reorderThreshold'] } }
            ]
        });
        
        // Pending housekeeping tasks
        const HousekeepingTask = require('../models/HousekeepingTask');
        const pendingHousekeeping = await HousekeepingTask.countDocuments({
            status: { $in: ['Pending', 'In Progress'] }
        });
        
        res.json({
            todayCheckIns,
            todayCheckOuts,
            currentOccupancy,
            totalRooms,
            availableRooms,
            occupancyRate: totalRooms > 0 ? ((currentOccupancy / totalRooms) * 100).toFixed(2) : 0,
            pendingBookings,
            todayRevenue,
            lowStockItems,
            pendingHousekeeping
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
