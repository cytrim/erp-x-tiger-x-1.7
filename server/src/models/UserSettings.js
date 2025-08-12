/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import mongoose from 'mongoose';

const DashboardWidgetSchema = new mongoose.Schema({
  widgetKey: String,
  layout: { type: Object, default: {} }
}, { _id: false });

const UserSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true },
  locale: { type: String, enum: ['de','en'], default: 'en' },
  tz: { type: String, default: 'Europe/Berlin' },
  dateFormat: { type: String, default: 'YYYY-MM-DD' },
  numberFormat: { type: String, default: '1,234.56' },
  currency: { type: String, default: 'EUR' },
  defaultCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  defaultBranch: { type: String },
  defaultWarehouse: { type: String },
  defaultTax: { type: Number, default: 19 },
  defaultPaymentMethod: { type: String, default: 'cash' },
  theme: { type: String, enum: ['light','dark','system'], default: 'system' },
  moduleVisibility: { type: Object, default: { invoices:true, quotes:true, products:true, customers:true, payments:true } },
  dashboard: { type: [DashboardWidgetSchema], default: [] },
  notifications: {
    email: { type: Boolean, default: true },
    web: { type: Boolean, default: true },
    telegram: { type: Boolean, default: false }
  },
  defaultFilters: { type: Object, default: {} },
  emailSignature: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('UserSettings', UserSettingsSchema);