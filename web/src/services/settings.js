/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import api from './api';

export async function getPreferences() {
  const { data } = await api.get('/me/preferences');
  return data.item;
}

export async function updatePreferences(payload) {
  const { data } = await api.patch('/me/preferences', payload);
  return data.item;
}