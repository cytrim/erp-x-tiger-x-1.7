/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import api from './api';
export const getQuotes = (params) => api.get('/quotes', { params });
export const createQuote = (payload) => api.post('/quotes', payload);
export const updateQuote = (id, payload) => api.put(`/quotes/${id}`, payload);
export const deleteQuote = (id) => api.delete(`/quotes/${id}`);