/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  sku: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 19 },
  unit: { type: String, default: 'pc' },
  active: { type: Boolean, default: true },
  description: { type: String }
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema);