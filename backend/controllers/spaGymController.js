
const Appointment = require('../models/SpaGymAppointment');

exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ _id: -1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createAppointment = async (req, res) => {
    try {
        const newAppointment = new Appointment(req.body);
        const savedAppointment = await newAppointment.save();
        res.status(201).json(savedAppointment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateAppointment = async (req, res) => {
    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedAppointment) return res.status(404).json({ message: 'Appointment not found' });
        res.json(updatedAppointment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
