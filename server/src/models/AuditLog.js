/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission. */

import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true }, // Denormalized for performance
  userEmail: { type: String, required: true },
  
  action: { 
    type: String, 
    enum: ['login', 'logout', 'create', 'update', 'delete', 'view', 'export', 'import', 'settings_change', 'permission_change', 'password_change', 'failed_login'],
    required: true 
  },
  
  module: { type: String, required: true }, // e.g., 'users', 'invoices', 'settings'
  entityType: { type: String }, // e.g., 'User', 'Invoice', 'Product'
  entityId: { type: String }, // ID of affected entity
  entityName: { type: String }, // Human-readable name
  
  changes: { type: mongoose.Schema.Types.Mixed }, // What was changed
  previousValues: { type: mongoose.Schema.Types.Mixed }, // Previous state
  newValues: { type: mongoose.Schema.Types.Mixed }, // New state
  
  ipAddress: { type: String },
  userAgent: { type: String },
  sessionId: { type: String },
  
  status: { type: String, enum: ['success', 'failed', 'warning'], default: 'success' },
  errorMessage: { type: String },
  
  metadata: { type: mongoose.Schema.Types.Mixed } // Additional context
}, { timestamps: true });

// Indexes for efficient querying
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ module: 1, action: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ createdAt: -1 });

// Auto-delete old logs after 90 days (optional)
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('AuditLog', AuditLogSchema);