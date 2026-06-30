const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const router = express.Router();

const User = require('../models/User');
const Session = require('../models/Session');
const { authenticate } = require('../middleware/auth');
const {
  loginLimiter,
  registerLimiter,
  resetLimiter,
  otpResendLimiter,
} = require('../middleware/rateLimiter');
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendLoginAlertEmail,
} = require('../utils/email');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get requesting IP, accounting for proxies */
function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/** Generate a 6-digit numeric OTP */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Issue JWT access + refresh tokens and set HTTP-only cookies */
function issueTokens(res, user) {
  const isAdmin = user.type === 'admin';
  const accessExpiry = isAdmin ? '8h' : '24h';
  const refreshExpiry = '7d';

  const accessToken = jwt.sign(
    { userId: user._id, type: user.type },
    process.env.JWT_SECRET,
    { expiresIn: accessExpiry }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: refreshExpiry }
  );

  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: isAdmin ? 8 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
}

/** Password policy: min 8, 1 upper, 1 lower, 1 digit, 1 special */
function validatePassword(pw) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/.test(
    pw
  );
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', registerLimiter, async (req, res, next) => {
  try {
    const { name, email, password, type = 'individual', company = '' } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
      });
    }
    if (!['individual', 'business'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid account type.' });
    }

    // Check duplicate
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      type,
      company: company.trim(),
      verificationToken: hashedOtp,
      verificationTokenExpiry: expiry,
      isVerified: false,
    });

    // Send OTP email (non-blocking — don't fail registration if email fails)
    sendVerificationEmail(user.email, user.name, otp).catch((err) =>
      console.error('[Email] sendVerificationEmail error:', err.message)
    );

    return res.status(201).json({
      success: true,
      data: { message: 'Account created. Please check your email for the OTP.', email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+verificationToken +verificationTokenExpiry'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }
    if (!user.verificationToken || !user.verificationTokenExpiry) {
      return res.status(400).json({ success: false, message: 'No pending OTP. Please request a new one.' });
    }
    if (new Date() > user.verificationTokenExpiry) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp.toString(), user.verificationToken);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    // Mark verified and clear OTP fields
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    // Send welcome email
    sendWelcomeEmail(user.email, user.name).catch((err) =>
      console.error('[Email] sendWelcomeEmail error:', err.message)
    );

    return res.json({ success: true, data: { message: 'Email verified successfully. You can now log in.' } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/resend-otp ────────────────────────────────────────────────
router.post('/resend-otp', otpResendLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+verificationToken +verificationTokenExpiry'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    user.verificationToken = hashedOtp;
    user.verificationTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    sendVerificationEmail(user.email, user.name, otp).catch((err) =>
      console.error('[Email] sendVerificationEmail error:', err.message)
    );

    return res.json({ success: true, data: { message: 'A new OTP has been sent to your email.' } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
        unverified: true,
      });
    }

    // Issue tokens
    const { accessToken, refreshToken } = issueTokens(res, user);

    // Create session
    const isAdmin = user.type === 'admin';
    const sessionExpiry = new Date(
      Date.now() + (isAdmin ? 8 : 24) * 60 * 60 * 1000
    );

    await Session.create({
      userId: user._id,
      token: accessToken,
      refreshToken,
      expiresAt: sessionExpiry,
      userAgent: req.headers['user-agent'] || '',
      ipAddress: getIP(req),
    });

    // Update last login
    const ip = getIP(req);
    const lastIp = user.lastLoginIP;
    user.lastLoginAt = new Date();
    user.lastLoginIP = ip;
    await user.save();

    // Alert on new IP
    if (lastIp && lastIp !== ip) {
      sendLoginAlertEmail(user.email, user.name, ip, new Date()).catch((err) =>
        console.error('[Email] sendLoginAlertEmail error:', err.message)
      );
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          type: user.type,
          company: user.company,
          isVerified: user.isVerified,
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
    const token = req.cookies?.accessToken;
    if (token) {
      await Session.deleteOne({ token });
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.json({ success: true, data: { message: 'Logged out successfully.' } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/logout-all ────────────────────────────────────────────────
router.post('/logout-all', authenticate, async (req, res, next) => {
  try {
    await Session.deleteMany({ userId: req.user._id });

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.json({ success: true, data: { message: 'All sessions revoked.' } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token not found.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      return res.status(401).json({ success: false, message: 'Session not found. Please log in again.' });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    // Delete old session and create a new one
    await Session.deleteOne({ _id: session._id });

    const { accessToken, refreshToken: newRefreshToken } = issueTokens(res, user);

    const isAdmin = user.type === 'admin';
    const sessionExpiry = new Date(
      Date.now() + (isAdmin ? 8 : 24) * 60 * 60 * 1000
    );

    await Session.create({
      userId: user._id,
      token: accessToken,
      refreshToken: newRefreshToken,
      expiresAt: sessionExpiry,
      userAgent: req.headers['user-agent'] || '',
      ipAddress: getIP(req),
    });

    return res.json({ success: true, data: { message: 'Token refreshed.' } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post('/forgot-password', resetLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    // Always return 200 to prevent email enumeration
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ success: true, data: { message: 'If an account exists, a reset link has been sent.' } });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    sendPasswordResetEmail(user.email, user.name, rawToken).catch((err) =>
      console.error('[Email] sendPasswordResetEmail error:', err.message)
    );

    return res.json({ success: true, data: { message: 'If an account exists, a reset link has been sent.' } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/reset-password ───────────────────────────────────────────
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpiry +password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    // Revoke all sessions
    await Session.deleteMany({ userId: user._id });

    return res.json({ success: true, data: { message: 'Password updated successfully. Please log in.' } });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  const { _id, name, email, type, company, isVerified, lastLoginAt } = req.user;
  return res.json({
    success: true,
    data: {
      user: { id: _id, name, email, type, company, isVerified, lastLoginAt },
    },
  });
});

module.exports = router;
