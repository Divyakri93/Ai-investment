import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'investiq-secret-key-default-change-in-prod';

export const requireAuth = (req, res, next) => {
  const token = req.cookies?.investiq_token;

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name
    };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token. Please sign in again.' });
  }
};

export const attachUserIfPresent = (req, res, next) => {
  const token = req.cookies?.investiq_token;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name
      };
    } catch (err) {
      // Ignore invalid cookie when auth is optional
    }
  }
  next();
};
