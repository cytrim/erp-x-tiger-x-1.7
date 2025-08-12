/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import UserProfile from '../models/UserProfile.js';
import User from '../models/User.js';

export async function getProfile(req, res, next) {
  try {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    
    let profile = await UserProfile.findOne({ userId }).populate('manager', 'name email');
    
    if (!profile) {
      // Create initial profile from user data
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      // Split name into first and last name
      const nameParts = user.name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      profile = await UserProfile.create({
        userId,
        firstName,
        lastName,
        personalEmail: user.email
      });
    }
    
    res.json({ item: profile });
  } catch (e) {
    next(e);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    
    // Remove sensitive fields that shouldn't be updated directly
    const { userId: _, _id, ...updateData } = req.body;
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );
    
    // Update User name if firstName or lastName changed
    if (updateData.firstName || updateData.lastName) {
      const fullName = `${updateData.firstName || ''} ${updateData.lastName || ''}`.trim();
      await User.findByIdAndUpdate(userId, { name: fullName });
    }
    
    res.json({ item: profile });
  } catch (e) {
    next(e);
  }
}

export async function uploadProfilePhoto(req, res, next) {
  try {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    
    // Handle file upload (you'll need to add multer or similar)
    // For now, just update the photo path
    const photoPath = req.body.photoPath || req.file?.path;
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: { profilePhoto: photoPath } },
      { new: true }
    );
    
    res.json({ item: profile });
  } catch (e) {
    next(e);
  }
}