/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission. */

import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import User from '../models/User.js';
import { logActivity } from '../utils/audit.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireRole(...roles) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const user = await User.findById(req.user.sub || req.user.id);
    if (!user || !user.active) {
      return res.status(403).json({ message: 'Account inactive' });
    }
    
    if (!roles.includes(user.role)) {
      await logActivity({
        user: req.user,
        action: 'permission_denied',
        module: req.baseUrl,
        status: 'failed',
        errorMessage: `Required role: ${roles.join(', ')}`,
        req
      });
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    next();
  };
}

export function requirePermission(module, action) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const user = await User.findById(req.user.sub || req.user.id).populate('roleId');
    if (!user || !user.active) {
      return res.status(403).json({ message: 'Account inactive' });
    }
    
    // Super admin has all permissions
    if (user.role === 'super_admin') {
      return next();
    }
    
    // Check if user has permission
    const hasPermission = await user.hasPermission(module, action);
    
    if (!hasPermission) {
      await logActivity({
        user: req.user,
        action: 'permission_denied',
        module,
        status: 'failed',
        errorMessage: `Required permission: ${module}:${action}`,
        req
      });
      return res.status(403).json({ 
        message: 'Forbidden',
        required: `${module}:${action}`
      });
    }
    
    next();
  };
}