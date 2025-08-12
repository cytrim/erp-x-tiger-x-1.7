/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission. */

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  
  // Erweiterte Felder für Admin-System
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  role: { type: String, enum: ['super_admin', 'admin', 'manager', 'staff', 'viewer', 'accountant', 'custom'], default: 'staff' },
  
  // Spezifische Berechtigungen (überschreiben Rolle)
  customPermissions: [{
    module: String,
    actions: {
      view: Boolean,
      create: Boolean,
      edit: Boolean,
      delete: Boolean,
      export: Boolean
    }
  }],
  
  // Account Status
  active: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  
  // Security
  lastLogin: { type: Date },
  lastLoginIp: { type: String },
  loginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  
  // Password Reset
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  passwordChangedAt: { type: Date },
  
  // Session Management
  activeSessions: [{
    token: String,
    deviceInfo: String,
    ipAddress: String,
    createdAt: Date,
    lastActivity: Date
  }],
  
  // Preferences
  locale: { type: String, enum: ['de', 'en'], default: 'en' },
  timezone: { type: String, default: 'Europe/Berlin' },
  theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
  
  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }, // Soft delete
  notes: { type: String }
}, { timestamps: true });

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, active: 1 });
UserSchema.index({ deletedAt: 1 });

// Virtual for checking if account is locked
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockedUntil && this.lockedUntil > Date.now());
});

// Method to check permissions
UserSchema.methods.hasPermission = async function(module, action) {
  // Super admin has all permissions
  if (this.role === 'super_admin') return true;
  
  // Check custom permissions first
  const customPerm = this.customPermissions?.find(p => p.module === module);
  if (customPerm) {
    return customPerm.actions[action] === true;
  }
  
  // Check role permissions
  if (this.roleId) {
    const Role = mongoose.model('Role');
    const role = await Role.findById(this.roleId);
    if (role) {
      const perm = role.permissions.find(p => p.module === module);
      return perm?.actions[action] === true;
    }
  }
  
  return false;
};

export default mongoose.model('User', UserSchema);