/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export async function autoSeedAdmin() {
  try {
    const doSeed = (process.env.AUTO_SEED || 'true').toLowerCase() === 'true';
    if (!doSeed) return;

    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'admin';

    const exists = await User.findOne({ email });
    if (exists) {
      console.log('AutoSeed: admin user already exists:', email);
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ name: 'Admin', email, passwordHash, role: 'admin', locale: process.env.DEFAULT_LOCALE || 'en' });
    console.log('AutoSeed: admin user created:', email);
  } catch (e) {
    console.error('AutoSeed error:', e?.message || e);
  }
}