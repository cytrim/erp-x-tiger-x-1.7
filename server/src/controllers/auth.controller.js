/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role, locale } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role, locale });
    return res.status(201).json({ id: user.id, email: user.email });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken({ sub: user.id, email: user.email, role: user.role, locale: user.locale });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, locale: user.locale } });
  } catch (e) { next(e); }
}