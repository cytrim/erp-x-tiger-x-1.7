/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, // optional for future multi-company
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  method: { type: String, enum: ['cash','bank','card','paypal','other'], default: 'cash' },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'EUR' },
  date: { type: Date, default: Date.now },
  reference: { type: String },
  status: { type: String, enum: ['received','cancelled'], default: 'received' },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model('Payment', PaymentSchema);