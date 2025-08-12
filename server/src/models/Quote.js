/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import mongoose from 'mongoose';

const QuoteItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  qty: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 19 }
}, { _id: false });

const QuoteSchema = new mongoose.Schema({
  number: { type: String, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  date: { type: Date, default: Date.now },
  validUntil: { type: Date },
  status: { type: String, enum: ['draft', 'sent', 'accepted', 'rejected'], default: 'draft' },
  currency: { type: String, default: 'EUR' },
  items: { type: [QuoteItemSchema], default: [] },
  totals: { net: Number, tax: Number, gross: Number },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model('Quote', QuoteSchema);