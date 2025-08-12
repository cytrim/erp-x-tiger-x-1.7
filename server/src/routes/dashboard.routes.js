import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getStats, getRecentActivity, getChartData } from '../controllers/dashboard.controller.js';

const r = Router();
r.use(requireAuth);
r.get('/stats', getStats);
r.get('/activity', getRecentActivity);
r.get('/charts', getChartData);
export default r;
