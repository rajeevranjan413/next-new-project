import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cc_dev_secret_change_in_prod';

// Attaches req.user when a valid Bearer token is present, but never rejects.
// Lets the same endpoint serve both logged-in users and anonymous guests.
export async function optionalAuth(req, _res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return next();

  try {
    const { sub } = jwt.verify(auth.slice(7), JWT_SECRET);
    const user = await User.findById(sub).lean();
    if (user) req.user = user;
  } catch {
    // Invalid/expired token — treat as guest, do not block.
  }
  next();
}
