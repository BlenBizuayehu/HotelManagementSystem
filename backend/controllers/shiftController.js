const Shift = require('../models/Shift');

exports.getShifts = async (req, res) => {
    try {
        const { isActive, search } = req.query;
        let query = {};

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const shifts = await Shift.find(query).sort({ startTime: 1 });
        res.json(shifts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getShift = async (req, res) => {
    try {
        const shift = await Shift.findById(req.params.id);
        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }
        res.json(shift);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createShift = async (req, res) => {
    try {
        // Validate time format
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(req.body.startTime) || !timeRegex.test(req.body.endTime)) {
            return res.status(400).json({ message: 'Invalid time format. Use HH:MM (24-hour format)' });
        }

        // Check for overlapping shifts (optional validation)
        const existingShifts = await Shift.find({ isActive: true });
        const newStart = req.body.startTime;
        const newEnd = req.body.endTime;

        // Basic overlap check (can be enhanced)
        for (const shift of existingShifts) {
            if (shift.startTime < shift.endTime) {
                // Normal shift (e.g., 9:00 - 17:00)
                if ((newStart >= shift.startTime && newStart < shift.endTime) ||
                    (newEnd > shift.startTime && newEnd <= shift.endTime) ||
                    (newStart <= shift.startTime && newEnd >= shift.endTime)) {
                    // Overlap detected - but we'll allow it for flexibility
                }
            }
        }

        const newShift = new Shift(req.body);
        const savedShift = await newShift.save();
        res.status(201).json(savedShift);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Shift name already exists' });
        }
        res.status(400).json({ message: err.message });
    }
};

exports.updateShift = async (req, res) => {
    try {
        // Validate time format if provided
        if (req.body.startTime || req.body.endTime) {
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (req.body.startTime && !timeRegex.test(req.body.startTime)) {
                return res.status(400).json({ message: 'Invalid startTime format. Use HH:MM (24-hour format)' });
            }
            if (req.body.endTime && !timeRegex.test(req.body.endTime)) {
                return res.status(400).json({ message: 'Invalid endTime format. Use HH:MM (24-hour format)' });
            }
        }

        const updatedShift = await Shift.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedShift) {
            return res.status(404).json({ message: 'Shift not found' });
        }
        res.json(updatedShift);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Shift name already exists' });
        }
        res.status(400).json({ message: err.message });
    }
};

exports.deleteShift = async (req, res) => {
    try {
        // Check if shift is assigned to any employees
        const Employee = require('../models/Employee');
        const employeesWithShift = await Employee.find({
            'assignedShifts.shift': req.params.id,
            deletedAt: null
        });

        if (employeesWithShift.length > 0) {
            return res.status(400).json({
                message: `Cannot delete shift. It is assigned to ${employeesWithShift.length} employee(s). Please reassign them first.`
            });
        }

        const shift = await Shift.findByIdAndDelete(req.params.id);
        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }
        res.json({ message: 'Shift deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
