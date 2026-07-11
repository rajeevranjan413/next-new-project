import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cc_dev_secret_change_in_prod';

// Requires a valid user Bearer token. Attaches req.user (full doc) or rejects 401.
// Unlike optionalAuth, this blocks the request when no valid session is present.
export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Login required' });
  }
  try {
    const { sub } = jwt.verify(auth.slice(7), JWT_SECRET);
    const user = await User.findById(sub);
    if (!user) return res.status(401).json({ success: false, error: 'Session expired' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}
