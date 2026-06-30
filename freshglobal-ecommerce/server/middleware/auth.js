const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

/**
 * Reads the access token from the HTTP-only cookie, verifies it,
 * confirms the session still exists in DB, and attaches req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Authentication required. Please log in.' });
    }

    // Verify JWT signature & expiry
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const msg =
        err.name === 'TokenExpiredError'
          ? 'Session expired. Please log in again.'
          : 'Invalid token. Please log in again.';
      return res.status(401).json({ success: false, message: msg });
    }

    // Check that the session still exists (logout invalidates it)
    const session = await Session.findOne({ token });
    if (!session) {
      return res
        .status(401)
        .json({ success: false, message: 'Session not found. Please log in again.' });
    }

    // Fetch user (password excluded by schema default)
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    req.user = user;
    req.sessionDoc = session;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Must be used AFTER authenticate.
 * Rejects non-admin users.
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.type !== 'admin') {
    return res
      .status(403)
      .json({ success: false, message: 'Access denied. Admin privileges required.' });
  }
  next();
};

/**
 * Must be used AFTER authenticate.
 * Rejects users whose email is not yet verified.
 */
const requireVerified = (req, res, next) => {
  if (!req.user?.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email not verified. Please verify your email first.',
    });
  }
  next();
};

module.exports = { authenticate, requireAdmin, requireVerified };
