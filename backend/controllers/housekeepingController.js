
const HousekeepingTask = require('../models/HousekeepingTask');
const Room = require('../models/Room');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');

const logAudit = async (userId, username, role, action, entityType, entityId, changes = {}, status = 'Success') => {
    try {
        await AuditLog.create({ userId, username, role, action, entityType, entityId, changes, status, timestamp: new Date() });
    } catch (err) {
        console.error('Audit log error:', err);
    }
};

exports.getTasks = async (req, res) => {
    try {
        const { status, assignedTo, roomId, priority } = req.query;
        const query = {};
        
        if (status) query.status = status;
        if (assignedTo) query.assignedTo = assignedTo;
        if (roomId) query.roomId = roomId;
        if (priority) query.priority = priority;
        
        const tasks = await HousekeepingTask.find(query)
            .populate('roomId', 'name roomNumber roomType status')
            .populate('assignedTo', 'name department')
            .populate('assignedBy', 'username')
            .sort({ scheduledFor: 1, priority: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTask = async (req, res) => {
    try {
        const task = await HousekeepingTask.findById(req.params.id)
            .populate('roomId')
            .populate('assignedTo')
            .populate('assignedBy')
            .populate('inspectedBy');
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const taskData = req.body;
        taskData.assignedBy = req.user._id;
        
        const task = await HousekeepingTask.create(taskData);
        
        // Update room housekeeping status
        if (task.roomId) {
            const room = await Room.findById(task.roomId);
            if (room) {
                room.housekeepingStatus = 'Needs Cleaning';
                await room.save();
            }
        }
        
        await logAudit(req.user._id, req.user.username, req.user.role, 'CREATE_HOUSEKEEPING_TASK', 'HousekeepingTask', task._id, {}, 'Success');
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.assignTask = async (req, res) => {
    try {
        const { assignedTo } = req.body;
        const task = await HousekeepingTask.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        
        const employee = await Employee.findById(assignedTo);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        
        task.assignedTo = assignedTo;
        task.status = 'Pending';
        await task.save();
        
        await logAudit(req.user._id, req.user.username, req.user.role, 'ASSIGN_HOUSEKEEPING_TASK', 'HousekeepingTask', task._id, { assignedTo }, 'Success');
        res.json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { status, checklist, notes } = req.body;
        const task = await HousekeepingTask.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        
        const oldStatus = task.status;
        task.status = status;
        
        if (status === 'In Progress' && !task.startedAt) {
            task.startedAt = new Date();
        }
        
        if (status === 'Completed') {
            task.completedAt = new Date();
            if (task.startedAt) {
                task.actualDuration = Math.round((task.completedAt - task.startedAt) / (1000 * 60));
            }
            
            // Update room status
            if (task.roomId) {
                const room = await Room.findById(task.roomId);
                if (room) {
                    room.housekeepingStatus = 'Clean';
                    room.lastCleaned = new Date();
                    await room.save();
                }
            }
        }
        
        if (checklist) task.checklist = checklist;
        if (notes) task.notes = notes;
        
        await task.save();
        
        await logAudit(req.user._id, req.user.username, req.user.role, 'UPDATE_HOUSEKEEPING_TASK', 'HousekeepingTask', task._id, {
            before: { status: oldStatus },
            after: { status: task.status }
        }, 'Success');
        
        res.json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.inspectTask = async (req, res) => {
    try {
        const { passed, notes } = req.body;
        const task = await HousekeepingTask.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        
        if (task.status !== 'Completed') {
            return res.status(400).json({ message: 'Task must be completed before inspection' });
        }
        
        task.status = passed ? 'Inspected' : 'Failed';
        task.inspectedAt = new Date();
        task.inspectedBy = req.user._id;
        if (notes) task.notes = (task.notes || '') + '\nInspection: ' + notes;
        
        // Update room status
        if (task.roomId) {
            const room = await Room.findById(task.roomId);
            if (room) {
                room.housekeepingStatus = passed ? 'Inspected' : 'Needs Cleaning';
                await room.save();
            }
        }
        
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await HousekeepingTask.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        
        await logAudit(req.user._id, req.user.username, req.user.role, 'DELETE_HOUSEKEEPING_TASK', 'HousekeepingTask', task._id, {}, 'Success');
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
