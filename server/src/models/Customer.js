/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('Customer', CustomerSchema);