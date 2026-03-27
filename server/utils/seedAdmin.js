require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

const seedMainAdmin = async () => {
  try {
    await connectDB();

    const existing = await Admin.findOne({ role: 'main_admin' });
    if (existing) {
      console.log('Main Admin already exists:', existing.email);
      process.exit(0);
    }

    const admin = await Admin.create({
      email: 'admin@niqs.org.ng',
      password: 'NiqsAdmin@2025',
      firstName: 'NIQS',
      lastName: 'Administrator',
      role: 'main_admin',
      isActive: true
    });

    console.log('Main Admin seeded successfully!');
    console.log('Email:', admin.email);
    console.log('Password: NiqsAdmin@2025');
    console.log('** Change this password immediately after first login **');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedMainAdmin();
