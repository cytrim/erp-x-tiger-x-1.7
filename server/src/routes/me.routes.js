import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getPreferences, updatePreferences } from '../controllers/me.controller.js';
import { getProfile, updateProfile, uploadProfilePhoto } from '../controllers/profile.controller.js';

const r = Router();
r.use(requireAuth);
r.get('/preferences', getPreferences);
r.put('/preferences', updatePreferences);
r.patch('/preferences', updatePreferences);
r.get('/profile', getProfile);
r.put('/profile', updateProfile);
r.post('/profile/photo', uploadProfilePhoto);
export default r;
