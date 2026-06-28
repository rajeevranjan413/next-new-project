import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cc_dev_secret_change_in_prod';

export function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}
