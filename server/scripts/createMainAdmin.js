/**
 * One-time script — creates the main (super) admin account.
 * Run once from the server folder:
 *   node scripts/createMainAdmin.js
 * Safe to run again — will skip if the email already exists.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Admin    = require('../models/Admin');

const ADMIN = {
  email:     'dolapo836@gmail.com',
  password:  'admin',
  firstName: 'Dolapo',
  lastName:  'Admin',
  role:      'main_admin',
  isActive:  true,
};

(async () => {
  try {
    console.log('Connecting to MongoDB…');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('Connected.\n');

    // Check if already exists
    const existing = await Admin.findOne({ email: ADMIN.email });
    if (existing) {
      console.log(`✅  Admin already exists → ${ADMIN.email}  (role: ${existing.role})`);
      console.log('    No changes made.');
      process.exit(0);
    }

    // Create
    const admin = await Admin.create(ADMIN);
    console.log('✅  Main admin created successfully!');
    console.log(`    Email : ${admin.email}`);
    console.log(`    Name  : ${admin.firstName} ${admin.lastName}`);
    console.log(`    Role  : ${admin.role}`);
    console.log(`    ID    : ${admin._id}`);
    console.log('\n🔐  Login at /admin-login with the credentials above.');
    process.exit(0);

  } catch (err) {
    console.error('❌  Error:', err.message);
    process.exit(1);
  }
})();
