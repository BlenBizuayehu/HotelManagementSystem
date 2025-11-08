
const InventoryItem = require('../models/InventoryItem');

exports.getInventory = async (req, res) => {
    try {
        const { 
            search, 
            category, 
            status, 
            lowStock,
            sortBy = 'name', 
            sortOrder = 'asc',
            page = 1,
            limit = 20
        } = req.query;

        // Build query
        let query = {};

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { 'supplier.name': { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Status filter (using virtual)
        if (status) {
            if (status === 'Low Stock') {
                query.$expr = { $lte: ['$stock', '$reorderThreshold'] };
            } else if (status === 'Out of Stock') {
                query.stock = { $lte: 0 };
            } else if (status === 'In Stock') {
                query.$expr = { $gt: ['$stock', '$reorderThreshold'] };
            }
        }

        // Low stock filter
        if (lowStock === 'true') {
            query.$expr = { $lte: ['$stock', '$reorderThreshold'] };
        }

        // Build sort object
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await InventoryItem.countDocuments(query);
        const items = await InventoryItem.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            items,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getInventoryItem = async (req, res) => {
    try {
        const item = await InventoryItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createInventoryItem = async (req, res) => {
    try {
        const newItem = new InventoryItem(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateInventoryItem = async (req, res) => {
    try {
        // If updating stock, update lastRestockDate
        if (req.body.stock !== undefined) {
            const currentItem = await InventoryItem.findById(req.params.id);
            if (currentItem && req.body.stock > currentItem.stock) {
                req.body.lastRestockDate = new Date();
            }
        }

        const updatedItem = await InventoryItem.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteInventoryItem = async (req, res) => {
    try {
        const item = await InventoryItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getLowStockAlerts = async (req, res) => {
    try {
        const items = await InventoryItem.find({
            $or: [
                { stock: { $lte: 0 } },
                { $expr: { $lte: ['$stock', '$reorderThreshold'] } }
            ]
        }).sort({ stock: 1 });
        
        const alerts = items.map(item => ({
            itemId: item._id,
            name: item.name,
            category: item.category,
            currentStock: item.stock,
            reorderThreshold: item.reorderThreshold,
            status: item.status,
            supplier: item.supplier,
            suggestedReorderQuantity: Math.max(item.reorderThreshold * 2, 10) - item.stock,
            urgency: item.stock <= 0 ? 'Critical' : item.stock <= item.reorderThreshold * 0.5 ? 'High' : 'Medium'
        }));
        
        res.json({
            totalAlerts: alerts.length,
            critical: alerts.filter(a => a.urgency === 'Critical').length,
            high: alerts.filter(a => a.urgency === 'High').length,
            medium: alerts.filter(a => a.urgency === 'Medium').length,
            alerts
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.exportToCSV = async (req, res) => {
    try {
        const items = await InventoryItem.find();
        
        // Convert to CSV format
        const headers = ['Name', 'Category', 'Unit', 'Stock', 'Reorder Threshold', 'Status', 'Supplier', 'Last Restock Date', 'Price Per Unit'];
        const rows = items.map(item => [
            item.name,
            item.category,
            item.unit,
            item.stock,
            item.reorderThreshold,
            item.status,
            item.supplier?.name || 'N/A',
            item.lastRestockDate ? new Date(item.lastRestockDate).toLocaleDateString() : 'N/A',
            item.pricePerUnit
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=inventory-export.csv');
        res.send(csvContent);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
