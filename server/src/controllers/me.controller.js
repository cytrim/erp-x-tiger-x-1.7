/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import UserSettings from '../models/UserSettings.js';
import User from '../models/User.js';

export async function getPreferences(req, res, next) {
  try {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    let settings = await UserSettings.findOne({ userId });
    if (!settings) {
      // bootstrap from User.locale if exists
      const user = await User.findById(userId);
      settings = await UserSettings.create({ userId, locale: user?.locale || 'en' });
    }
    res.json({ item: settings });
  } catch (e) { next(e); }
}

export async function updatePreferences(req, res, next) {
  try {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const payload = req.body || {};
    const item = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: payload },
      { new: true, upsert: true }
    );
    // Optional: update User.locale if locale changed
    if (payload.locale) {
      await User.findByIdAndUpdate(userId, { locale: payload.locale });
    }
    res.json({ item });
  } catch (e) { next(e); }
}