/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import Quote from '../models/Quote.js';
import Sequence from '../models/Sequence.js';
import { parseQuery, paginate } from '../utils/pagination.js';
import { calcDocTotals } from '../utils/calc.js';

export async function list(req, res, next) {
  try {
    const { page, pageSize, search, sort } = parseQuery(req.query);
    const filter = search ? { $or: [
      { number: { $regex: search, $options: 'i' } },
      { status: { $regex: search, $options: 'i' } }
    ] } : {};
    const data = await paginate(Quote, { page, pageSize, filter, sort });
    res.json(data);
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const seq = await Sequence.next('quote');
    const number = `Q-${new Date().getFullYear()}-${String(seq).padStart(4,'0')}`;
    const payload = { ...req.body };
    const totals = calcDocTotals(payload.items || []);
    const item = await Quote.create({ ...payload, number, totals });
    res.status(201).json({ item });
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (Array.isArray(payload.items)) payload.totals = calcDocTotals(payload.items);
    const item = await Quote.findByIdAndUpdate(id, payload, { new: true });
    res.json({ item });
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await Quote.findByIdAndDelete(id);
    res.status(204).end();
  } catch (e) { next(e); }
}