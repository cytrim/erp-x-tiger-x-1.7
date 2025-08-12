/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission. */

import AuditLog from '../models/AuditLog.js';

export async function logActivity({
  user,
  action,
  module,
  entityType,
  entityId,
  entityName,
  changes,
  previousValues,
  newValues,
  status = 'success',
  errorMessage,
  metadata,
  req
}) {
  try {
    const log = {
      userId: user?.sub || user?.id || user?._id,
      userName: user?.name || 'System',
      userEmail: user?.email || 'system@tigerx.com',
      action,
      module,
      entityType,
      entityId,
      entityName,
      changes,
      previousValues,
      newValues,
      status,
      errorMessage,
      metadata
    };
    
    // Extract request info if available
    if (req) {
      log.ipAddress = req.ip || req.connection?.remoteAddress;
      log.userAgent = req.headers['user-agent'];
      log.sessionId = req.sessionID;
    }
    
    await AuditLog.create(log);
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - logging failures shouldn't break the app
  }
}