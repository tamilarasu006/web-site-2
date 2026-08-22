const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    return res.json({ success: true, data: { users } });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/orders ────────────────────────────────────────────────────
router.get('/orders', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: { product: true }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: { orders } });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/admin/orders/:id/status ─────────────────────────────────────────
router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    });

    return res.json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
