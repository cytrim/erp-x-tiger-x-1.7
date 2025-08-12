/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import api from './api';
export const getProducts = (params) => api.get('/products', { params });
export const createProduct = (payload) => api.post('/products', payload);
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload);
export const deleteProduct = (id) => api.delete(`/products/${id}`);