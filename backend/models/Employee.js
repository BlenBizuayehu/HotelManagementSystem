
const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Active', 'On Leave'],
        default: 'Active' 
    },
});

module.exports = mongoose.model('Employee', EmployeeSchema);
