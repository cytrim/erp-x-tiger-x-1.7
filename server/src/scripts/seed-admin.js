/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import User from '../models/User.js';

(async () => {
  try {
    await mongoose.connect(config.mongoUri);
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'secret';
    const exists = await User.findOne({ email });
    if (exists) {
      console.log('Admin existiert bereits:', email);
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      await User.create({ name: 'Admin', email, passwordHash, role: 'admin', locale: process.env.DEFAULT_LOCALE || 'en' });
      console.log('Admin erstellt:', email);
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();