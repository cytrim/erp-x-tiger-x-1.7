/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import Product from '../models/Product.js';
import { parseQuery, paginate } from '../utils/pagination.js';

export async function list(req, res, next) {
  try {
    const { page, pageSize, search, sort } = parseQuery(req.query);
    const filter = search ? { $or: [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ] } : {};
    const data = await paginate(Product, { page, pageSize, filter, sort });
    res.json(data);
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const item = await Product.create(req.body);
    res.status(201).json({ item });
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const item = await Product.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ item });
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(204).end();
  } catch (e) { next(e); }
}