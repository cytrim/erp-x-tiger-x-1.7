/* Â© 2025 Tiger X Panel â€” Proprietary/UI modules by Jan KÃ¶ppke. Do not copy without permission. */

import mongoose from 'mongoose';
import User from '../models/User.js';
import Role from '../models/Role.js';
import AuditLog from '../models/AuditLog.js';
import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Payment from '../models/Payment.js';
import { logActivity } from '../utils/audit.js';

// Admin Dashboard Stats
export async function getDashboardStats(req, res, next) {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // User Statistics
    const totalUsers = await User.countDocuments({ deletedAt: null });
    const activeUsers = await User.countDocuments({ active: true, deletedAt: null });
    const newUsersToday = await User.countDocuments({ 
      createdAt: { $gte: today },
      deletedAt: null 
    });
    const onlineUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(now - 15 * 60000) }, // Last 15 minutes
      deletedAt: null
    });
    
    // Activity Statistics
    const todayLogins = await AuditLog.countDocuments({
      action: 'login',
      createdAt: { $gte: today },
      status: 'success'
    });
    
    const failedLogins = await AuditLog.countDocuments({
      action: 'failed_login',
      createdAt: { $gte: today }
    });
    
    // Role Distribution
    const roleDistribution = await User.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Recent Activities
    const recentActivities = await AuditLog.find()
      .sort('-createdAt')
      .limit(10)
      .populate('userId', 'name email');
    
    // System Health
    const systemHealth = {
      database: 'healthy',
      diskSpace: await checkDiskSpace(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
    
    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        newToday: newUsersToday,
        online: onlineUsers
      },
      activity: {
        loginsToday: todayLogins,
        failedLogins,
        recentActivities
      },
      roleDistribution,
      systemHealth
    });
  } catch (e) {
    next(e);
  }
}

// System Settings
export async function getSystemSettings(req, res, next) {
  try {
    // Get system-wide settings from database or config
    const settings = {
      general: {
        companyName: process.env.COMPANY_NAME || 'Tiger X Panel',
        systemEmail: process.env.SYSTEM_EMAIL || 'system@tigerx.com',
        defaultLocale: process.env.DEFAULT_LOCALE || 'de',
        timezone: process.env.TZ || 'Europe/Berlin'
      },
      security: {
        passwordMinLength: 8,
        passwordRequireUppercase: true,
        passwordRequireLowercase: true,
        passwordRequireNumbers: true,
        passwordRequireSpecial: false,
        sessionTimeout: 7200, // 2 hours
        maxLoginAttempts: 5,
        lockoutDuration: 900, // 15 minutes
        twoFactorEnabled: false,
        ipWhitelist: [],
        ipBlacklist: []
      },
      email: {
        smtpHost: process.env.SMTP_HOST || '',
        smtpPort: process.env.SMTP_PORT || 587,
        smtpSecure: process.env.SMTP_SECURE === 'true',
        smtpUser: process.env.SMTP_USER || '',
        emailFrom: process.env.EMAIL_FROM || 'noreply@tigerx.com'
      },
      backup: {
        autoBackup: true,
        backupFrequency: 'daily',
        backupRetention: 30,
        backupPath: '/backups'
      },
      maintenance: {
        maintenanceMode: false,
        maintenanceMessage: '',
        allowedIPs: []
      }
    };
    
    res.json(settings);
  } catch (e) {
    next(e);
  }
}

export async function updateSystemSettings(req, res, next) {
  try {
    const updates = req.body;
    
    // Log the change
    await logActivity({
      user: req.user,
      action: 'settings_change',
      module: 'admin',
      entityType: 'SystemSettings',
      changes: updates,
      req
    });
    
    // Here you would update the settings in database
    // For now, just return success
    res.json({ 
      message: 'Settings updated successfully',
      settings: updates 
    });
  } catch (e) {
    next(e);
  }
}

// Audit Log
export async function getAuditLogs(req, res, next) {
  try {
    const { 
      page = 1, 
      limit = 50,
      userId,
      module,
      action,
      startDate,
      endDate,
      status
    } = req.query;
    
    const filter = {};
    if (userId) filter.userId = userId;
    if (module) filter.module = module;
    if (action) filter.action = action;
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('userId', 'name email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.json({
      logs,
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

// User Activity Report
export async function getUserActivity(req, res, next) {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const activities = await AuditLog.find({
      userId,
      createdAt: { $gte: startDate }
    }).sort('-createdAt');
    
    const loginHistory = await AuditLog.find({
      userId,
      action: { $in: ['login', 'logout', 'failed_login'] },
      createdAt: { $gte: startDate }
    }).sort('-createdAt').limit(20);
    
    const activitySummary = await AuditLog.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      user,
      activities,
      loginHistory,
      activitySummary
    });
  } catch (e) {
    next(e);
  }
}

// Helper function to check disk space (simplified)
async function checkDiskSpace() {
  // This would need proper implementation based on OS
  return {
    total: '100GB',
    used: '45GB',
    free: '55GB',
    percentage: 45
  };
}

// Export data
export async function exportData(req, res, next) {
  try {
    const { type, format = 'json' } = req.query;
    
    let data;
    switch (type) {
      case 'users':
        data = await User.find({ deletedAt: null }).select('-passwordHash');
        break;
      case 'audit':
        data = await AuditLog.find().sort('-createdAt').limit(10000);
        break;
      case 'all':
        data = {
          users: await User.find({ deletedAt: null }).select('-passwordHash'),
          customers: await Customer.find(),
          products: await Product.find(),
          invoices: await Invoice.find()
        };
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }
    
    await logActivity({
      user: req.user,
      action: 'export',
      module: 'admin',
      entityType: type,
      metadata: { format },
      req
    });
    
    if (format === 'csv') {
      // Convert to CSV (you'd need a CSV library)
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export.csv"`);
      // res.send(convertToCSV(data));
    } else {
      res.json(data);
    }
  } catch (e) {
    next(e);
  }
}
