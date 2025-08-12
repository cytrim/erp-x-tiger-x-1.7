/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const signToken = (payload) =>
  jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, config.jwtSecret);