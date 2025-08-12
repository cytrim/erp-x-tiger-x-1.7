/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import mongoose from 'mongoose';

const SequenceSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: { type: Number, default: 0 }
});

SequenceSchema.statics.next = async function(key) {
  const s = await this.findOneAndUpdate(
    { key },
    { $inc: { value: 1 } },
    { upsert: true, new: true }
  );
  return s.value;
};

export default mongoose.model('Sequence', SequenceSchema);