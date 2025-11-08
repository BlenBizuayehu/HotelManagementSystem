
const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: String, required: true },
    shift: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Shift',
        required: true
    },
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
