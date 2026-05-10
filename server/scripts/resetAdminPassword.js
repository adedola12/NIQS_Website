/**
 * Recovery script — resets an admin account's password directly in the DB.
 * Run from the `server` folder. Reads MONGO_URI from your local .env.
 *
 * Usage (PowerShell):
 *   $env:ADMIN_EMAIL="dolapo836@gmail.com"; $env:NEW_PASSWORD="MyNewPass!23"; node scripts/resetAdminPassword.js
 *
 * Usage (bash):
 *   ADMIN_EMAIL=dolapo836@gmail.com NEW_PASSWORD='MyNewPass!23' node scripts/resetAdminPassword.js
 *
 * If ADMIN_EMAIL is omitted, it defaults to the email used in createMainAdmin.js.
 * If NEW_PASSWORD is omitted, the script aborts so you don't accidentally set a known one.
 *
 * The pre-save hook in server/models/Admin.js bcrypt-hashes the password automatically.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Admin    = require('../models/Admin');

const EMAIL    = (process.env.ADMIN_EMAIL || 'dolapo836@gmail.com').toLowerCase().trim();
const PASSWORD = process.env.NEW_PASSWORD;

(async () => {
  if (!PASSWORD || PASSWORD.length < 8) {
    console.error('Refusing to run. Set NEW_PASSWORD to at least 8 characters.');
    console.error('Example (PowerShell):  $env:NEW_PASSWORD="MyNewPass!23"; node scripts/resetAdminPassword.js');
    process.exit(2);
  }
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing from .env. Add it before running this script.');
    process.exit(2);
  }

  try {
    console.log('Connecting to MongoDB…');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('Connected.\n');

    const admin = await Admin.findOne({ email: EMAIL });
    if (!admin) {
      console.error(`No admin found with email "${EMAIL}".`);
      console.error('Tip: list known admin emails with:');
      console.error('  node -e "require(\'./models/Admin\').find({}, \'email role\').then(console.log)"');
      process.exit(1);
    }

    admin.password = PASSWORD;            // pre-save hook will bcrypt this
    admin.isActive = true;                // re-activate in case it was disabled
    await admin.save();

    console.log('Password reset successful.');
    console.log(`  Email : ${admin.email}`);
    console.log(`  Role  : ${admin.role}`);
    console.log(`  Name  : ${admin.firstName} ${admin.lastName}`);
    console.log('\nYou can now sign in at /login (Admin Login tab) with the new password.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
