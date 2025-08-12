/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import { Router } from 'express';
import { list, create, update, remove } from '../controllers/products.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const r = Router();
r.use(requireAuth);
r.get('/', list);
r.post('/', requireRole('admin', 'staff'), create);
r.put('/:id', requireRole('admin', 'staff'), update);
r.delete('/:id', requireRole('admin'), remove);
export default r;