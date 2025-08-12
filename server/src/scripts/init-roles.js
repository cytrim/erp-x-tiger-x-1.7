/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission. */

import 'dotenv/config';
import mongoose from 'mongoose';
import { config } from '../config.js';
import Role from '../models/Role.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

(async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');
    
    // Create default roles
    await Role.createDefaultRoles();
    
    // Update existing admin user to super_admin
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      const superAdminRole = await Role.findOne({ name: 'super_admin' });
      adminUser.role = 'super_admin';
      adminUser.roleId = superAdminRole._id;
      await adminUser.save();
      console.log(`Updated ${adminEmail} to super_admin role`);
    }
    
    console.log('Initialization complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
})();