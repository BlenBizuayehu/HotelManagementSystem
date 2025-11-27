import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const adminProtect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.id).select('-password');
      
      if (!req.admin || !req.admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin account not found or inactive',
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (req.admin.role === 'super-admin') {
      return next();
    }

    if (!req.admin.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};
