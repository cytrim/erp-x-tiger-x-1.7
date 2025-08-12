/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

export function parseQuery(q) {
  const page = Math.max(1, parseInt(q.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(q.pageSize || '25', 10)));
  const search = (q.search || '').trim();
  const sort = (q.sort || '-createdAt').toString();
  return { page, pageSize, search, sort };
}

export async function paginate(Model, { page, pageSize, filter = {}, projection = null, sort = '-createdAt', populate = null, lean = false }) {
  const skip = (page - 1) * pageSize;
  let q = Model.find(filter, projection).sort(sort).skip(skip).limit(pageSize);
  if (populate) {
    if (Array.isArray(populate)) populate.forEach(p => q = q.populate(p));
    else q = q.populate(populate);
  }
  if (lean) q = q.lean();
  const [items, total] = await Promise.all([
    q,
    Model.countDocuments(filter)
  ]);
  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}