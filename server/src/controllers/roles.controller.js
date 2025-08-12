/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission. */

import Role from '../models/Role.js';
import User from '../models/User.js';
import { logActivity } from '../utils/audit.js';

// List all roles
export async function listRoles(req, res, next) {
  try {
    const roles = await Role.find({ active: true }).sort('priority');
    
    // Count users per role
    const rolesWithCount = await Promise.all(
      roles.map(async (role) => {
        const userCount = await User.countDocuments({ 
          roleId: role._id,
          deletedAt: null 
        });
        return {
          ...role.toObject(),
          userCount
        };
      })
    );
    
    res.json(rolesWithCount);
  } catch (e) {
    next(e);
  }
}

// Get single role
export async function getRole(req, res, next) {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    
    const userCount = await User.countDocuments({ 
      roleId: role._id,
      deletedAt: null 
    });
    
    res.json({
      ...role.toObject(),
      userCount
    });
  } catch (e) {
    next(e);
  }
}

// Create role
export async function createRole(req, res, next) {
  try {
    const role = await Role.create(req.body);
    
    await logActivity({
      user: req.user,
      action: 'create',
      module: 'roles',
      entityType: 'Role',
      entityId: role._id,
      entityName: role.displayName,
      req
    });
    
    res.status(201).json(role);
  } catch (e) {
    next(e);
  }
}

// Update role
export async function updateRole(req, res, next) {
  try {
    const { id } = req.params;
    
    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    
    // Don't allow editing system roles (except permissions)
    if (role.isSystem && req.body.name) {
      delete req.body.name;
      delete req.body.isSystem;
    }
    
    Object.assign(role, req.body);
    await role.save();
    
    await logActivity({
      user: req.user,
      action: 'update',
      module: 'roles',
      entityType: 'Role',
      entityId: role._id,
      entityName: role.displayName,
      changes: req.body,
      req
    });
    
    res.json(role);
  } catch (e) {
    next(e);
  }
}

// Delete role
export async function deleteRole(req, res, next) {
  try {
    const { id } = req.params;
    
    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    
    if (role.isSystem) {
      return res.status(400).json({ message: 'Cannot delete system role' });
    }
    
    // Check if role is in use
    const usersWithRole = await User.countDocuments({ roleId: id });
    if (usersWithRole > 0) {
      return res.status(400).json({ 
        message: `Cannot delete role. ${usersWithRole} users are assigned to this role.` 
      });
    }
    
    await role.deleteOne();
    
    await logActivity({
      user: req.user,
      action: 'delete',
      module: 'roles',
      entityType: 'Role',
      entityId: role._id,
      entityName: role.displayName,
      req
    });
    
    res.json({ message: 'Role deleted successfully' });
  } catch (e) {
    next(e);
  }
}

// Clone role
export async function cloneRole(req, res, next) {
  try {
    const { id } = req.params;
    const { name, displayName } = req.body;
    
    const sourceRole = await Role.findById(id);
    if (!sourceRole) return res.status(404).json({ message: 'Source role not found' });
    
    const newRole = await Role.create({
      name: name || `${sourceRole.name}_copy`,
      displayName: displayName || `${sourceRole.displayName} (Copy)`,
      description: sourceRole.description,
      permissions: sourceRole.permissions,
      isSystem: false,
      priority: sourceRole.priority,
      color: sourceRole.color
    });
    
    await logActivity({
      user: req.user,
      action: 'create',
      module: 'roles',
      entityType: 'Role',
      entityId: newRole._id,
      entityName: newRole.displayName,
      metadata: { clonedFrom: sourceRole._id },
      req
    });
    
    res.status(201).json(newRole);
  } catch (e) {
    next(e);
  }
}