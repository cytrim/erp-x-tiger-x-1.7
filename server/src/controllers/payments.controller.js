/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import { parseQuery, paginate } from '../utils/pagination.js';

async function updateInvoicePaymentStatus(invoiceId) {
  const inv = await Invoice.findById(invoiceId);
  if (!inv) return;
  const payments = await Payment.aggregate([
    { $match: { invoiceId: inv._id, status: 'received' } },
    { $group: { _id: '$invoiceId', total: { $sum: '$amount' } } }
  ]);
  const paid = payments.length ? payments[0].total : 0;
  const gross = inv.totals?.gross || 0;
  let status = inv.status;
  const now = new Date();
  if (paid >= gross && gross > 0) status = 'paid';
  else if (inv.dueDate && inv.dueDate < now) status = 'overdue';
  else if (paid > 0) status = 'partial';
  else if (status === 'paid') status = 'sent'; // guard
  await Invoice.findByIdAndUpdate(invoiceId, { status });
}

export async function list(req, res, next) {
  try {
    const { page, pageSize, search, sort } = parseQuery(req.query);
    const filter = search
      ? { $or: [
          { method: { $regex: search, $options: 'i' } },
          { reference: { $regex: search, $options: 'i' } }
        ] }
      : {};
    const data = await paginate(Payment, { page, pageSize, filter, sort, populate: ['invoiceId','customerId'] });
    res.json(data);
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const payload = { ...req.body };
    // derive customer from invoice if missing
    if (payload.invoiceId && !payload.customerId) {
      const inv = await Invoice.findById(payload.invoiceId);
      if (!inv) return res.status(400).json({ message: 'Invoice not found' });
      payload.customerId = inv.customerId;
      if (!payload.currency) payload.currency = inv.currency || 'EUR';
    }
    const item = await Payment.create(payload);
    await updateInvoicePaymentStatus(item.invoiceId);
    res.status(201).json({ item });
  } catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try {
    const { id } = req.params;
    const item = await Payment.findById(id).populate('invoiceId').populate('customerId');
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json({ item });
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const item = await Payment.findByIdAndUpdate(id, req.body, { new: true });
    if (item) await updateInvoicePaymentStatus(item.invoiceId);
    res.json({ item });
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const prev = await Payment.findByIdAndDelete(id);
    if (prev) await updateInvoicePaymentStatus(prev.invoiceId);
    res.status(204).end();
  } catch (e) { next(e); }
}