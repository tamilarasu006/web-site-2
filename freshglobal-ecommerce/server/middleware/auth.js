const jwt = require('jsonwebtoken');

/**
 * Reads the access token from the HTTP-only cookie, verifies it,
 * confirms the user still exists in DB, and attaches req.user.
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

    const prisma = req.app.get('prisma');
    if (!prisma) {
      return res.status(500).json({ success: false, message: 'Database client not initialized.' });
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    req.user = user;
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
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, message: 'Access denied. Admin privileges required.' });
  }
  next();
};

/**
 * Must be used AFTER authenticate.
 * Rejects users whose email is not yet verified.
 * (We removed isVerified from prisma schema as it wasn't requested, assuming all are verified for now,
 * but keeping middleware structure intact if needed later)
 */
const requireVerified = (req, res, next) => {
  // If you want to add isVerified to Prisma schema later, uncomment this:
  // if (!req.user?.isVerified) {
  //   return res.status(403).json({
  //     success: false,
  //     message: 'Email not verified. Please verify your email first.',
  //   });
  // }
  next();
};

module.exports = { authenticate, requireAdmin, requireVerified };
