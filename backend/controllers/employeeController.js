
const Employee = require('../models/Employee');

exports.getEmployees = async (req, res) => {
    try {
        const { 
            search, 
            department, 
            role, 
            status, 
            sortBy = 'name', 
            sortOrder = 'asc',
            includeDeleted = false 
        } = req.query;

        // Build query
        let query = {};
        
        // Soft delete filter
        if (!includeDeleted) {
            query.deletedAt = null;
        }

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } },
                { 'contactInfo.email': { $regex: search, $options: 'i' } }
            ];
        }

        // Department filter
        if (department) {
            query.department = department;
        }

        // Role filter
        if (role) {
            query.role = role;
        }

        // Status filter
        if (status) {
            query.status = status;
        }

        // Build sort object
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const employees = await Employee.find(query).sort(sortOptions);
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee || employee.deletedAt) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createEmployee = async (req, res) => {
    try {
        const newEmployee = new Employee(req.body);
        const savedEmployee = await newEmployee.save();
        res.status(201).json(savedEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee || employee.deletedAt) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        res.json(updatedEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Soft delete
        employee.deletedAt = new Date();
        await employee.save();
        
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.restoreEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        employee.deletedAt = null;
        await employee.save();
        
        res.json({ message: 'Employee restored successfully', employee });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addPerformanceReview = async (req, res) => {
    try {
        const { reviewer, comment, rating } = req.body;
        const employee = await Employee.findById(req.params.id);
        
        if (!employee || employee.deletedAt) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        employee.performanceMetrics.reviews.push({ reviewer, comment, rating });
        
        // Recalculate average rating
        const reviews = employee.performanceMetrics.reviews;
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        employee.performanceMetrics.rating = avgRating;
        
        await employee.save();
        res.json(employee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
