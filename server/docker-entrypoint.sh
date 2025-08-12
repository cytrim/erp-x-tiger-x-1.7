#!/bin/sh
set -e

echo "🚀 Tiger X Panel API starting..."

# Function to check MongoDB
check_mongo() {
    node -e "
    const mongoose = require('mongoose');
    const uri = process.env.MONGO_URI || 'mongodb://mongo:27017/erp';
    mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
        .then(() => { console.log('✅ MongoDB is ready'); process.exit(0); })
        .catch((err) => { console.log('⏳ Waiting for MongoDB...'); process.exit(1); });
    " 2>/dev/null
}

# Wait for MongoDB with timeout
echo "⏳ Waiting for MongoDB..."
COUNTER=0
MAX_TRIES=60

until check_mongo || [ $COUNTER -eq $MAX_TRIES ]; do
    COUNTER=$((COUNTER + 1))
    echo "   Attempt $COUNTER/$MAX_TRIES..."
    sleep 2
done

if [ $COUNTER -eq $MAX_TRIES ]; then
    echo "❌ MongoDB connection timeout after $MAX_TRIES attempts"
    exit 1
fi

echo "✅ MongoDB connected successfully"

# Auto-seed if enabled
if [ "$AUTO_SEED" = "true" ]; then
    echo "🌱 Running auto-seed..."
    node src/scripts/seed-admin.js || echo "⚠️  Seed might have already run"
fi

# Start the application
echo "🎯 Starting API server on port ${PORT:-5000}..."
exec node src/index.js