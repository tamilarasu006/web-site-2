const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

// ─── Helpers ─────────────────────────────────────────────────────────────────
function issueTokens(res, user) {
  const isAdmin = user.role === 'admin';
  const accessExpiry = isAdmin ? '8h' : '24h';
  
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: accessExpiry }
  );

  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: isAdmin ? 8 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  });

  return { accessToken };
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', registerLimiter, async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const prisma = req.app.get('prisma');

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
        phone: phone || null,
        role: 'customer'
      }
    });

    return res.status(201).json({
      success: true,
      data: { message: 'Account created successfully.', email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const prisma = req.app.get('prisma');

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    issueTokens(res, user);

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    res.clearCookie('accessToken');
    return res.json({ success: true, data: { message: 'Logged out successfully.' } });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  const { id, name, email, role } = req.user;
  return res.json({
    success: true,
    data: {
      user: { id, name, email, role },
    },
  });
});

module.exports = router;
