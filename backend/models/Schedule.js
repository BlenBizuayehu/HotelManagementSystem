
const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: String, required: true },
    shift: { 
        type: String, 
        enum: ['Morning (9AM-5PM)', 'Evening (3PM-11PM)', 'Night (11PM-7AM)'],
        required: true
    },
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
