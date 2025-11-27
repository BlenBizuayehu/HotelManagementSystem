import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Admin from '../models/Admin.js';

dotenv.config();
connectDB();

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@hailehotels.com' });
    
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create default admin
    const admin = await Admin.create({
      username: 'admin',
      email: 'admin@hailehotels.com',
      password: 'admin123', // Change this in production!
      role: 'super-admin',
      firstName: 'Admin',
      lastName: 'User',
      permissions: [
        'manage-employees',
        'manage-bookings',
        'manage-rooms',
        'manage-inventory',
        'manage-schedules',
        'view-reports',
        'manage-settings',
      ],
    });

    console.log('✅ Default admin created successfully!');
    console.log('Username: admin');
    console.log('Email: admin@hailehotels.com');
    console.log('Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
