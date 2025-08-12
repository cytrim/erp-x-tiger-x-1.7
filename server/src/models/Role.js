/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission. */

import mongoose from 'mongoose';

const PermissionSchema = new mongoose.Schema({
  module: { 
    type: String, 
    enum: ['dashboard', 'customers', 'products', 'invoices', 'quotes', 'payments', 'reports', 'settings', 'admin'],
    required: true 
  },
  actions: {
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    export: { type: Boolean, default: false }
  }
}, { _id: false });

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  description: { type: String },
  permissions: [PermissionSchema],
  isSystem: { type: Boolean, default: false }, // System roles can't be deleted
  priority: { type: Number, default: 0 }, // Higher = more important
  color: { type: String, default: '#8c8c8c' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Default roles
RoleSchema.statics.createDefaultRoles = async function() {
  const defaultRoles = [
    {
      name: 'super_admin',
      displayName: 'Super Admin',
      description: 'Vollzugriff auf alle Systembereiche',
      isSystem: true,
      priority: 100,
      color: '#f5222d',
      permissions: [
        { module: 'dashboard', actions: { view: true, create: true, edit: true, delete: true, export: true }},
        { module: 'customers', actions: { view: true, create: true, edit: true, delete: true, export: true }},
        { module: 'products', actions: { view: true, create: true, edit: true, delete: true, export: true }},
        { module: 'invoices', actions: { view: true, create: true, edit: true, delete: true, export: true }},
        { module: 'quotes', actions: { view: true, create: true, edit: true, delete: true, export: true }},
        { module: 'payments', actions: { view: true, create: true, edit: true, delete: true, export: true }},
        { module: 'reports', actions: { view: true, create: true, edit: true, delete: true, export: true }},
        { module: 'settings', actions: { view: true, create: true, edit: true, delete: true, export: true }},
        { module: 'admin', actions: { view: true, create: true, edit: true, delete: true, export: true }}
      ]
    },
    {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Verwaltung des Systems',
      isSystem: true,
      priority: 90,
      color: '#ff6b35',
      permissions: [
        { module: 'dashboard', actions: { view: true, create: true, edit: true, delete: false, export: true }},
        { module: 'customers', actions: { view: true, create: true, edit: true, delete: true, export: true }},
        { module: 'products', actions: { view: true, create: true, edit: true, delete: true, export: true }},
        { module: 'invoices', actions: { view: true, create: true, edit: true, delete: true, export: true }},
        { module: 'quotes', actions: { view: true, create: true, edit: true, delete: true, export: true }},
        { module: 'payments', actions: { view: true, create: true, edit: true, delete: true, export: true }},
        { module: 'reports', actions: { view: true, create: false, edit: false, delete: false, export: true }},
        { module: 'settings', actions: { view: true, create: true, edit: true, delete: false, export: false }},
        { module: 'admin', actions: { view: true, create: true, edit: true, delete: false, export: true }}
      ]
    },
    {
      name: 'manager',
      displayName: 'Manager',
      description: 'Teamleitung mit erweiterten Rechten',
      isSystem: true,
      priority: 70,
      color: '#1890ff',
      permissions: [
        { module: 'dashboard', actions: { view: true, create: false, edit: false, delete: false, export: true }},
        { module: 'customers', actions: { view: true, create: true, edit: true, delete: false, export: true }},
        { module: 'products', actions: { view: true, create: true, edit: true, delete: false, export: true }},
        { module: 'invoices', actions: { view: true, create: true, edit: true, delete: false, export: true }},
        { module: 'quotes', actions: { view: true, create: true, edit: true, delete: false, export: true }},
        { module: 'payments', actions: { view: true, create: true, edit: true, delete: false, export: true }},
        { module: 'reports', actions: { view: true, create: false, edit: false, delete: false, export: true }},
        { module: 'settings', actions: { view: true, create: false, edit: true, delete: false, export: false }}
      ]
    },
    {
      name: 'staff',
      displayName: 'Mitarbeiter',
      description: 'Standard Mitarbeiter',
      isSystem: true,
      priority: 50,
      color: '#52c41a',
      permissions: [
        { module: 'dashboard', actions: { view: true, create: false, edit: false, delete: false, export: false }},
        { module: 'customers', actions: { view: true, create: true, edit: true, delete: false, export: false }},
        { module: 'products', actions: { view: true, create: false, edit: false, delete: false, export: false }},
        { module: 'invoices', actions: { view: true, create: true, edit: true, delete: false, export: false }},
        { module: 'quotes', actions: { view: true, create: true, edit: true, delete: false, export: false }},
        { module: 'payments', actions: { view: true, create: true, edit: false, delete: false, export: false }},
        { module: 'settings', actions: { view: true, create: false, edit: true, delete: false, export: false }}
      ]
    },
    {
      name: 'viewer',
      displayName: 'Betrachter',
      description: 'Nur Leserechte',
      isSystem: true,
      priority: 30,
      color: '#8c8c8c',
      permissions: [
        { module: 'dashboard', actions: { view: true, create: false, edit: false, delete: false, export: false }},
        { module: 'customers', actions: { view: true, create: false, edit: false, delete: false, export: false }},
        { module: 'products', actions: { view: true, create: false, edit: false, delete: false, export: false }},
        { module: 'invoices', actions: { view: true, create: false, edit: false, delete: false, export: false }},
        { module: 'quotes', actions: { view: true, create: false, edit: false, delete: false, export: false }},
        { module: 'payments', actions: { view: true, create: false, edit: false, delete: false, export: false }}
      ]
    },
    {
      name: 'accountant',
      displayName: 'Buchhalter',
      description: 'Zugriff auf Finanzdaten',
      isSystem: false,
      priority: 60,
      color: '#faad14',
      permissions: [
        { module: 'dashboard', actions: { view: true, create: false, edit: false, delete: false, export: true }},
        { module: 'customers', actions: { view: true, create: false, edit: false, delete: false, export: true }},
        { module: 'products', actions: { view: true, create: false, edit: false, delete: false, export: true }},
        { module: 'invoices', actions: { view: true, create: false, edit: true, delete: false, export: true }},
        { module: 'quotes', actions: { view: true, create: false, edit: false, delete: false, export: true }},
        { module: 'payments', actions: { view: true, create: true, edit: true, delete: false, export: true }},
        { module: 'reports', actions: { view: true, create: false, edit: false, delete: false, export: true }}
      ]
    }
  ];

  for (const roleData of defaultRoles) {
    const exists = await this.findOne({ name: roleData.name });
    if (!exists) {
      await this.create(roleData);
      console.log(`Created default role: ${roleData.name}`);
    }
  }
};

export default mongoose.model('Role', RoleSchema);