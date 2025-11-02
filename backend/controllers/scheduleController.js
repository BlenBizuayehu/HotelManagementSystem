
const Schedule = require('../models/Schedule');
const Employee = require('../models/Employee');

exports.getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find().populate('employeeId', 'name');
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createSchedule = async (req, res) => {
    try {
        const newSchedule = new Schedule(req.body);
        await newSchedule.save();
        const populatedSchedule = await Schedule.findById(newSchedule._id).populate('employeeId', 'name');
        res.status(201).json(populatedSchedule);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findByIdAndDelete(req.params.id);
        if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
        res.json({ message: 'Schedule deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
