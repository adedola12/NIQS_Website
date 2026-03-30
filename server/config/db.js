const mongoose = require('mongoose');
const dns      = require('dns');

// Override DNS to use Google (8.8.8.8) + Cloudflare (1.1.1.1) —
// prevents ESERVFAIL errors when the system/ISP DNS can't resolve Atlas hostnames
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,   // 30s to find a server
      socketTimeoutMS:          45000,   // 45s socket idle timeout
      connectTimeoutMS:         30000,   // 30s to establish connection
      heartbeatFrequencyMS:     10000,   // ping Atlas every 10s to keep alive
      maxPoolSize:              10,      // connection pool
      retryWrites:              true,
    });

    console.log(`✅  MongoDB Connected: ${conn.connection.host}`);

    // Log when Mongoose auto-reconnects
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected — attempting to reconnect…');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('✅  MongoDB reconnected');
    });
    mongoose.connection.on('error', (err) => {
      console.error('❌  MongoDB error:', err.message);
    });

  } catch (error) {
    console.error('❌  MongoDB Connection Error:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Check your MONGO_URI in .env');
    console.error('2. Whitelist your IP in Atlas → Network Access → Add 0.0.0.0/0');
    console.error('3. Verify Atlas cluster is not paused (free tier pauses after 7 days)');
    console.error('');

    // Retry once after 5 seconds
    console.log('Retrying in 5 seconds…');
    setTimeout(async () => {
      try {
        await mongoose.connect(process.env.MONGO_URI, {
          serverSelectionTimeoutMS: 30000,
          heartbeatFrequencyMS:     10000,
        });
        console.log('✅  MongoDB reconnected on retry');
      } catch (retryErr) {
        console.error('❌  Retry failed:', retryErr.message);
        console.error('Server will continue running — DB-dependent endpoints will fail until reconnected.');
      }
    }, 5000);
  }
};

module.exports = connectDB;
