
const Service = require('../models/Service');
const ServiceBooking = require('../models/ServiceBooking');

exports.getServices = async (req, res) => {
    try {
        const { category, search, isAvailable } = req.query;
        let query = {};

        if (category) query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';

        const services = await Service.find(query).populate('assignedStaff', 'name');
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate('assignedStaff', 'name');
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(service);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createService = async (req, res) => {
    try {
        const newService = new Service(req.body);
        const savedService = await newService.save();
        res.status(201).json(savedService);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const updatedService = await Service.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!updatedService) return res.status(404).json({ message: 'Service not found' });
        res.json(updatedService);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json({ message: 'Service deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addReview = async (req, res) => {
    try {
        const { guestName, rating, comment } = req.body;
        const service = await Service.findById(req.params.id);
        
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        service.reviews.push({ guestName, rating, comment });
        await service.save();
        
        res.json(service);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.assignStaff = async (req, res) => {
    try {
        const { staffIds } = req.body;
        const service = await Service.findById(req.params.id);
        
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        service.assignedStaff = staffIds;
        await service.save();
        
        const populatedService = await Service.findById(req.params.id).populate('assignedStaff', 'name');
        res.json(populatedService);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
