/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/payments.controller.js';

const r = Router();
r.use(requireAuth);
r.get('/', ctrl.list);
r.post('/', ctrl.create);
r.get('/:id', ctrl.getOne);
r.patch('/:id', ctrl.update);
r.delete('/:id', ctrl.remove);
export default r;