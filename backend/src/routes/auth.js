import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { UserRepository } from '../models/User.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'investiq-secret-key-default-change-in-prod';

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.' }
});

const setAuthCookie = (res, user) => {
  const userId = String(user._id || user.id);
  const token = jwt.sign(
    { userId, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('investiq_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

router.post('/auth/signup', authRateLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Full name is required.' });
      return;
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await UserRepository.findByEmail(normalizedEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address is already registered.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const createdUser = await UserRepository.createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    setAuthCookie(res, createdUser);

    res.status(201).json({
      user: {
        id: String(createdUser._id || createdUser.id),
        name: createdUser.name,
        email: createdUser.email
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error during account registration.' });
  }
});

router.post('/auth/login', authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await UserRepository.findByEmailWithPassword(normalizedEmail);
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    await UserRepository.updateLastLogin(user._id || user.id);

    setAuthCookie(res, user);

    res.status(200).json({
      user: {
        id: String(user._id || user.id),
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

router.post('/auth/logout', (req, res) => {
  res.clearCookie('investiq_token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.status(200).json({ message: 'Successfully signed out.' });
});

router.get('/auth/me', requireAuth, (req, res) => {
  res.status(200).json({
    user: req.user
  });
});

export default router;
