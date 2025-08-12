/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import api from './api';

export async function list(params = {}) {
  const { page=1, pageSize=10, search='', sort='-createdAt' } = params;
  const q = new URLSearchParams({ page, pageSize, search, sort }).toString();
  const { data } = await api.get(`/payments?${q}`);
  return data;
}

export async function create(payload) {
  const { data } = await api.post('/payments', payload);
  return data;
}

export async function getOne(id) {
  const { data } = await api.get(`/payments/${id}`);
  return data;
}

export async function update(id, payload) {
  const { data } = await api.patch(`/payments/${id}`, payload);
  return data;
}

export async function remove(id) {
  await api.delete(`/payments/${id}`);
}