const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');

// ─── POST /api/orders ────────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { items, shippingAddress, billingAddress, paymentMethod } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain items' });
    }

    // Process order in a transaction
    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;
        
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          subtotal
        });

        // Update stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity }
        });
      }

      // Create Order
      const orderNumber = `ORD-${Date.now()}`;
      const order = await tx.order.create({
        data: {
          userId: req.user.id,
          orderNumber,
          totalAmount,
          shippingAddress,
          billingAddress,
          items: {
            create: orderItemsData
          },
          payments: {
            create: {
              paymentMethod,
              paymentStatus: 'pending',
              amount: totalAmount
            }
          }
        },
        include: {
          items: true,
          payments: true
        }
      });

      return order;
    });

    return res.status(201).json({ success: true, data: { order: result } });
  } catch (err) {
    if (err.message.includes('Insufficient stock') || err.message.includes('not found')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
});

// ─── GET /api/orders ─────────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: { include: { product: true } },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: { orders } });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/orders/:id ─────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { product: true } },
        payments: true
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
