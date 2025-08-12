/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission. */

import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Role from '../models/Role.js';
import AuditLog from '../models/AuditLog.js';
import { logActivity } from '../utils/audit.js';
import { sendEmail } from '../utils/email.js';
import crypto from 'crypto';

// List all users
export async function listUsers(req, res, next) {
  try {
    const { 
      page = 1, 
      limit = 25,
      search,
      role,
      active,
      sort = '-createdAt'
    } = req.query;
    
    const filter = { deletedAt: null };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) filter.role = role;
    if (active !== undefined) filter.active = active === 'true';
    
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-passwordHash -twoFactorSecret')
      .populate('roleId', 'name displayName color')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (e) {
    next(e);
  }
}

// Get single user
export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash -twoFactorSecret')
      .populate('roleId')
      .populate('createdBy', 'name email')
      .populate('modifiedBy', 'name email');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (e) {
    next(e);
  }
}

// Create new user
export async function createUser(req, res, next) {
  try {
    const { 
      name, 
      email, 
      password,
      role,
      roleId,
      customPermissions,
      active = true,
      sendInvite = true 
    } = req.body;
    
    // Check if email exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    
    // Generate password if not provided
    const tempPassword = password || crypto.randomBytes(8).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    
    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'staff',
      roleId,
      customPermissions,
      active,
      createdBy: req.user.sub || req.user.id,
      emailVerificationToken: crypto.randomBytes(32).toString('hex')
    });
    
    // Send invitation email
    if (sendInvite) {
      await sendEmail({
        to: email,
        subject: 'Welcome to Tiger X Panel',
        text: `
          Hello ${name},
          
          Your account has been created. Here are your login details:
          
          Email: ${email}
          Temporary Password: ${tempPassword}
          
          Please login and change your password immediately.
          
          Login URL: ${process.env.APP_URL || 'http://localhost:5173'}/login
        `
      });
    }
    
    // Log activity
    await logActivity({
      user: req.user,
      action: 'create',
      module: 'users',
      entityType: 'User',
      entityId: user._id,
      entityName: user.name,
      req
    });
    
    res.status(201).json({
      user: user.toObject({ transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.twoFactorSecret;
        return ret;
      }}),
      tempPassword: sendInvite ? undefined : tempPassword
    });
  } catch (e) {
    next(e);
  }
}

// Update user
export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    
    // Don't allow password update through this endpoint
    delete updates.password;
    delete updates.passwordHash;
    
    // Track who made the change
    updates.modifiedBy = req.user.sub || req.user.id;
    
    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash -twoFactorSecret');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Log activity
    await logActivity({
      user: req.user,
      action: 'update',
      module: 'users',
      entityType: 'User',
      entityId: user._id,
      entityName: user.name,
      changes: updates,
      req
    });
    
    res.json(user);
  } catch (e) {
    next(e);
  }
}

// Delete user (soft delete)
export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    
    // Don't allow deleting yourself
    if (id === req.user.sub || id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Soft delete
    user.deletedAt = new Date();
    user.active = false;
    await user.save();
    
    // Log activity
    await logActivity({
      user: req.user,
      action: 'delete',
      module: 'users',
      entityType: 'User',
      entityId: user._id,
      entityName: user.name,
      req
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (e) {
    next(e);
  }
}

// Toggle user status
export async function toggleUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.active = !user.active;
    await user.save();
    
    // Log activity
    await logActivity({
      user: req.user,
      action: 'update',
      module: 'users',
      entityType: 'User',
      entityId: user._id,
      entityName: user.name,
      changes: { active: user.active },
      req
    });
    
    res.json({ 
      message: `User ${user.active ? 'activated' : 'deactivated'} successfully`,
      active: user.active 
    });
  } catch (e) {
    next(e);
  }
}

// Reset user password
export async function resetUserPassword(req, res, next) {
  try {
    const { id } = req.params;
    const { password, sendEmail: shouldSendEmail = true } = req.body;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Generate new password
    const newPassword = password || crypto.randomBytes(8).toString('hex');
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordChangedAt = new Date();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    // Send email
    if (shouldSendEmail) {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset',
        text: `Your password has been reset. New password: ${newPassword}`
      });
    }
    
    // Log activity
    await logActivity({
      user: req.user,
      action: 'password_change',
      module: 'users',
      entityType: 'User',
      entityId: user._id,
      entityName: user.name,
      req
    });
    
    res.json({ 
      message: 'Password reset successfully',
      tempPassword: shouldSendEmail ? undefined : newPassword
    });
  } catch (e) {
    next(e);
  }
}

// Update user permissions
export async function updateUserPermissions(req, res, next) {
  try {
    const { id } = req.params;
    const { roleId, customPermissions } = req.body;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Update role and permissions
    if (roleId) {
      const role = await Role.findById(roleId);
      if (!role) return res.status(400).json({ message: 'Invalid role' });
      user.roleId = roleId;
      user.role = role.name;
    }
    
    if (customPermissions) {
      user.customPermissions = customPermissions;
    }
    
    await user.save();
    
    // Log activity
    await logActivity({
      user: req.user,
      action: 'permission_change',
      module: 'users',
      entityType: 'User',
      entityId: user._id,
      entityName: user.name,
      changes: { roleId, customPermissions },
      req
    });
    
    res.json({ 
      message: 'Permissions updated successfully',
      user: user.toObject({ transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.twoFactorSecret;
        return ret;
      }})
    });
  } catch (e) {
    next(e);
  }
}

// Get user sessions
export async function getUserSessions(req, res, next) {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('activeSessions lastLogin lastLoginIp');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({
      sessions: user.activeSessions || [],
      lastLogin: user.lastLogin,
      lastLoginIp: user.lastLoginIp
    });
  } catch (e) {
    next(e);
  }
}

// Terminate user session
export async function terminateSession(req, res, next) {
  try {
    const { id, sessionId } = req.params;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.activeSessions = user.activeSessions.filter(
      session => session._id.toString() !== sessionId
    );
    await user.save();
    
    res.json({ message: 'Session terminated successfully' });
  } catch (e) {
    next(e);
  }
}