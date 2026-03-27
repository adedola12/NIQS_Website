const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Check your MONGO_URI in .env');
    console.error('2. Whitelist your IP in Atlas → Network Access → Add Current IP');
    console.error('3. If SRV fails, try standard format: mongodb://user:pass@host:27017/niqs');
    console.error('');
    console.error('Server will continue running without DB (public pages still work).');
  }
};

module.exports = connectDB;
