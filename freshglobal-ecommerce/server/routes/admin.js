const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Session = require('../models/Session');
const AdminLog = require('../models/AdminLog');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// ─── Helper ───────────────────────────────────────────────────────────────────
function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

async function log(adminId, action, details, ipAddress) {
  try {
    await AdminLog.create({ adminId, action, details, ipAddress });
  } catch (err) {
    console.error('[AdminLog]', err.message);
  }
}

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const query = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: {
        users,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/admin/users/:id ─────────────────────────────────────────────────
router.put('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowedUpdates = ['name', 'type', 'company', 'isVerified'];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await log(req.user._id, 'UPDATE_USER', { targetUserId: id, updates }, getIP(req));

    return res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Revoke all sessions for the deleted user
    await Session.deleteMany({ userId: id });

    await log(req.user._id, 'DELETE_USER', { targetUserId: id, email: user.email }, getIP(req));

    return res.json({ success: true, data: { message: 'User deleted successfully.' } });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/logs ──────────────────────────────────────────────────────
router.get('/logs', async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const [logs, total] = await Promise.all([
      AdminLog.find()
        .populate('adminId', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      AdminLog.countDocuments(),
    ]);

    return res.json({
      success: true,
      data: {
        logs,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/sessions ──────────────────────────────────────────────────
router.get('/sessions', async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const [sessions, total] = await Promise.all([
      Session.find()
        .populate('userId', 'name email type')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Session.countDocuments(),
    ]);

    // Strip raw tokens from response for security
    const safeSessions = sessions.map((s) => ({
      _id: s._id,
      user: s.userId,
      expiresAt: s.expiresAt,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
    }));

    return res.json({
      success: true,
      data: {
        sessions: safeSessions,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
