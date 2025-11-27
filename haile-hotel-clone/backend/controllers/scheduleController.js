import Schedule from '../models/Schedule.js';

export const getSchedules = async (req, res) => {
  try {
    const { employeeId, date, department, startDate, endDate } = req.query;
    const query = {};

    if (employeeId) query.employee = employeeId;
    if (department) query.department = department;
    if (date) {
      const targetDate = new Date(date);
      query.date = {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
      };
    }
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const schedules = await Schedule.find(query)
      .populate('employee', 'firstName lastName employeeId email phone role')
      .populate('assignedBy', 'firstName lastName')
      .sort({ date: 1, startTime: 1 });

    res.json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId email phone role')
      .populate('assignedBy', 'firstName lastName');

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.create({
      ...req.body,
      assignedBy: req.admin.id,
    });

    await schedule.populate('employee', 'firstName lastName employeeId');
    await schedule.populate('assignedBy', 'firstName lastName');

    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('employee', 'firstName lastName employeeId')
      .populate('assignedBy', 'firstName lastName');

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    await schedule.deleteOne();
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkCreateSchedules = async (req, res) => {
  try {
    const { schedules } = req.body; // Array of schedule objects

    const createdSchedules = await Schedule.insertMany(
      schedules.map((s) => ({
        ...s,
        assignedBy: req.admin.id,
      }))
    );

    await Schedule.populate(createdSchedules, {
      path: 'employee',
      select: 'firstName lastName employeeId',
    });

    res.status(201).json({ success: true, data: createdSchedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
