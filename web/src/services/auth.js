/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import api from './api';

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (payload) => api.post('/auth/register', payload);