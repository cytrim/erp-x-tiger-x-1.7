/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission. */

import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import * as adminCtrl from '../controllers/admin.controller.js';
import * as usersCtrl from '../controllers/users.controller.js';
import * as rolesCtrl from '../controllers/roles.controller.js';

const router = Router();

// All admin routes require authentication
router.use(requireAuth);

// Dashboard
router.get('/dashboard', requirePermission('admin', 'view'), adminCtrl.getDashboardStats);

// System Settings
router.get('/settings', requirePermission('admin', 'view'), adminCtrl.getSystemSettings);
router.put('/settings', requirePermission('admin', 'edit'), adminCtrl.updateSystemSettings);

// Audit Logs
router.get('/audit-logs', requirePermission('admin', 'view'), adminCtrl.getAuditLogs);
router.get('/audit-logs/user/:userId', requirePermission('admin', 'view'), adminCtrl.getUserActivity);

// Data Export
router.get('/export', requirePermission('admin', 'export'), adminCtrl.exportData);

// User Management
router.get('/users', requirePermission('admin', 'view'), usersCtrl.listUsers);
router.get('/users/:id', requirePermission('admin', 'view'), usersCtrl.getUser);
router.post('/users', requirePermission('admin', 'create'), usersCtrl.createUser);
router.put('/users/:id', requirePermission('admin', 'edit'), usersCtrl.updateUser);
router.delete('/users/:id', requirePermission('admin', 'delete'), usersCtrl.deleteUser);
router.post('/users/:id/toggle-status', requirePermission('admin', 'edit'), usersCtrl.toggleUserStatus);
router.post('/users/:id/reset-password', requirePermission('admin', 'edit'), usersCtrl.resetUserPassword);
router.put('/users/:id/permissions', requirePermission('admin', 'edit'), usersCtrl.updateUserPermissions);
router.get('/users/:id/sessions', requirePermission('admin', 'view'), usersCtrl.getUserSessions);
router.delete('/users/:id/sessions/:sessionId', requirePermission('admin', 'edit'), usersCtrl.terminateSession);

// Role Management
router.get('/roles', requirePermission('admin', 'view'), rolesCtrl.listRoles);
router.get('/roles/:id', requirePermission('admin', 'view'), rolesCtrl.getRole);
router.post('/roles', requirePermission('admin', 'create'), rolesCtrl.createRole);
router.put('/roles/:id', requirePermission('admin', 'edit'), rolesCtrl.updateRole);
router.delete('/roles/:id', requirePermission('admin', 'delete'), rolesCtrl.deleteRole);
router.post('/roles/:id/clone', requirePermission('admin', 'create'), rolesCtrl.cloneRole);

export default router;