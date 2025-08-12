/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import api from './api';
export const getInvoices = (params) => api.get('/invoices', { params });
export const createInvoice = (payload) => api.post('/invoices', payload);
export const updateInvoice = (id, payload) => api.put(`/invoices/${id}`, payload);
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`);

export async function list(params = {}) {
  const { data } = await api.get('/invoices', { params });
  // normalize to { items, total, page, pageSize }
  if (Array.isArray(data.items) || Array.isArray(data.results)) return data;
  if (Array.isArray(data)) return { items: data, total: data.length, page: 1, pageSize: data.length };
  return data;
}