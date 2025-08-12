/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import Customer from '../models/Customer.js';

export async function list(req, res, next) {
  try {
    const items = await Customer.find().sort({ createdAt: -1 });
    res.json({ items });
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const item = await Customer.create(req.body);
    res.status(201).json({ item });
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const item = await Customer.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ item });
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await Customer.findByIdAndDelete(id);
    res.status(204).end();
  } catch (e) { next(e); }
}