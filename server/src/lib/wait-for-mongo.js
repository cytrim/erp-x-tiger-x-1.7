/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission. */
import mongoose from 'mongoose';

const uri = process.env.MONGO_URI || 'mongodb://mongo:27017/erp';
const timeoutMs = parseInt(process.env.MONGO_WAIT_TIMEOUT || '300000', 10); // 5 min
const retryInterval = 2000; // 2 seconds
const start = Date.now();

console.log('🔄 MongoDB Connection Manager');
console.log(`   URI: ${uri.replace(/\/\/.*@/, '//***@')}`); // Hide credentials
console.log(`   Timeout: ${timeoutMs / 1000}s`);

async function tryConnect() {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    
    await mongoose.disconnect();
    return true;
  } catch (err) {
    return false;
  }
}

(async function main() {
  let attempts = 0;
  
  while (true) {
    attempts++;
    const elapsed = Date.now() - start;
    
    if (elapsed > timeoutMs) {
      console.error(`❌ MongoDB not reachable after ${timeoutMs / 1000}s`);
      process.exit(1);
    }
    
    console.log(`⏳ Connection attempt ${attempts}...`);
    
    if (await tryConnect()) {
      console.log(`✅ MongoDB is ready after ${attempts} attempts (${(elapsed / 1000).toFixed(1)}s)`);
      process.exit(0);
    }
    
    // Show progress every 10 attempts
    if (attempts % 10 === 0) {
      console.log(`   Still waiting... (${(elapsed / 1000).toFixed(0)}s elapsed)`);
    }
    
    await new Promise(resolve => setTimeout(resolve, retryInterval));
  }
})();