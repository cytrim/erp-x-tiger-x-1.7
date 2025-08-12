/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import mongoose from 'mongoose';
import { config } from '../config.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri, { autoIndex: true });
  console.log('✓ MongoDB connected');
}